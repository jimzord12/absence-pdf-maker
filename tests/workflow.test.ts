import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKFLOW_PATH = path.resolve(__dirname, '../.github/workflows/deploy.yml');

interface Workflow {
  name: string;
  on: Record<string, any>;
  permissions?: Record<string, string>;
  concurrency?: {
    group: string;
    'cancel-in-progress': boolean;
  };
  jobs: Record<string, Job>;
}

interface Job {
  environment?: {
    name: string;
    url: string;
  };
  'runs-on': string;
  steps: Step[];
}

interface Step {
  name: string;
  uses?: string;
  run?: string;
  with?: Record<string, string>;
  id?: string;
}

describe('GitHub Actions Deployment Workflow', () => {
  let workflow: Workflow;
  let workflowContent: string;

  beforeAll(() => {
    workflowContent = fs.readFileSync(WORKFLOW_PATH, 'utf-8');
    workflow = yaml.load(workflowContent) as Workflow;
  });

  describe('1. File existence', () => {
    it('should have the workflow file created', () => {
      expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
    });

    it('should be valid YAML syntax', () => {
      expect(workflow).toBeDefined();
      expect(typeof workflow).toBe('object');
    });
  });

  describe('2. Workflow name', () => {
    it('should have a descriptive workflow name', () => {
      expect(workflow.name).toBeDefined();
      expect(typeof workflow.name).toBe('string');
      expect(workflow.name.length).toBeGreaterThan(0);
    });
  });

  describe('3. Triggers', () => {
    it('should trigger on push to main branch', () => {
      expect(workflow.on.push).toBeDefined();
      expect(workflow.on.push.branches).toBeDefined();
      expect(workflow.on.push.branches).toContain('main');
    });

    it('should support workflow_dispatch for manual runs', () => {
      expect(workflow.on.workflow_dispatch).toBeDefined();
    });
  });

  describe('4. Permissions', () => {
    it('should have correct permissions for contents: read', () => {
      expect(workflow.permissions).toBeDefined();
      expect(workflow.permissions?.contents).toBe('read');
    });

    it('should have correct permissions for pages: write', () => {
      expect(workflow.permissions?.pages).toBe('write');
    });

    it('should have correct permissions for id-token: write', () => {
      expect(workflow.permissions?.['id-token']).toBe('write');
    });
  });

  describe('5. Concurrency', () => {
    it('should have concurrency group set to pages', () => {
      expect(workflow.concurrency).toBeDefined();
      expect(workflow.concurrency?.group).toBe('pages');
    });

    it('should have cancel-in-progress set to true', () => {
      expect(workflow.concurrency?.['cancel-in-progress']).toBe(true);
    });
  });

  describe('6. Jobs', () => {
    it('should have a deploy job', () => {
      expect(workflow.jobs).toBeDefined();
      expect(workflow.jobs.deploy).toBeDefined();
    });

    it('should run on ubuntu-latest', () => {
      expect(workflow.jobs.deploy['runs-on']).toBe('ubuntu-latest');
    });

    it('should have github-pages environment setup', () => {
      const job = workflow.jobs.deploy;
      expect(job.environment).toBeDefined();
      expect(job.environment?.name).toBe('github-pages');
      expect(job.environment?.url).toBe('${{ steps.deployment.outputs.page_url }}');
    });
  });

  describe('7. Steps - Checkout', () => {
    it('should include checkout@v5 step', () => {
      const steps = workflow.jobs.deploy.steps;
      const checkoutStep = steps.find((s) => s.uses === 'actions/checkout@v5');
      expect(checkoutStep).toBeDefined();
      expect(checkoutStep?.name).toBe('Checkout');
    });
  });

  describe('8. Steps - Setup Node.js', () => {
    it('should include setup-node@v6 step', () => {
      const steps = workflow.jobs.deploy.steps;
      const setupStep = steps.find((s) => s.uses === 'actions/setup-node@v6');
      expect(setupStep).toBeDefined();
      expect(setupStep?.name).toBe('Setup Node.js');
    });

    it('should have node-version set to 20', () => {
      const steps = workflow.jobs.deploy.steps;
      const setupStep = steps.find((s) => s.uses === 'actions/setup-node@v6');
      expect(setupStep?.with?.['node-version']).toBe('20');
    });

    it('should have npm cache enabled', () => {
      const steps = workflow.jobs.deploy.steps;
      const setupStep = steps.find((s) => s.uses === 'actions/setup-node@v6');
      expect(setupStep?.with?.cache).toBe('npm');
    });
  });

  describe('9. Steps - Install dependencies', () => {
    it('should include npm ci step', () => {
      const steps = workflow.jobs.deploy.steps;
      const installStep = steps.find((s) => s.run === 'npm ci');
      expect(installStep).toBeDefined();
      expect(installStep?.name).toBe('Install dependencies');
    });
  });

  describe('10. Steps - Type check', () => {
    it('should include npm run typecheck step', () => {
      const steps = workflow.jobs.deploy.steps;
      const typecheckStep = steps.find((s) => s.run === 'npm run typecheck');
      expect(typecheckStep).toBeDefined();
      expect(typecheckStep?.name).toBe('Type check');
    });
  });

  describe('11. Steps - Lint', () => {
    it('should include npm run lint step', () => {
      const steps = workflow.jobs.deploy.steps;
      const lintStep = steps.find((s) => s.run === 'npm run lint');
      expect(lintStep).toBeDefined();
      expect(lintStep?.name).toBe('Lint');
    });
  });

  describe('12. Steps - Build', () => {
    it('should include npm run build step', () => {
      const steps = workflow.jobs.deploy.steps;
      const buildStep = steps.find((s) => s.run === 'npm run build');
      expect(buildStep).toBeDefined();
      expect(buildStep?.name).toBe('Build');
    });
  });

  describe('13. Steps - Configure Pages', () => {
    it('should include configure-pages@v5 step', () => {
      const steps = workflow.jobs.deploy.steps;
      const configureStep = steps.find((s) => s.uses === 'actions/configure-pages@v5');
      expect(configureStep).toBeDefined();
      expect(configureStep?.name).toBe('Setup Pages');
    });
  });

  describe('14. Steps - Upload artifact', () => {
    it('should include upload-pages-artifact@v4 step', () => {
      const steps = workflow.jobs.deploy.steps;
      const uploadStep = steps.find((s) => s.uses === 'actions/upload-pages-artifact@v4');
      expect(uploadStep).toBeDefined();
      expect(uploadStep?.name).toBe('Upload artifact');
    });

    it('should have path set to ./dist', () => {
      const steps = workflow.jobs.deploy.steps;
      const uploadStep = steps.find((s) => s.uses === 'actions/upload-pages-artifact@v4');
      expect(uploadStep?.with?.path).toBe('./dist');
    });
  });

  describe('15. Steps - Deploy to Pages', () => {
    it('should include deploy-pages@v4 step', () => {
      const steps = workflow.jobs.deploy.steps;
      const deployStep = steps.find((s) => s.uses === 'actions/deploy-pages@v4');
      expect(deployStep).toBeDefined();
      expect(deployStep?.name).toBe('Deploy to GitHub Pages');
    });

    it('should have deployment step id', () => {
      const steps = workflow.jobs.deploy.steps;
      const deployStep = steps.find((s) => s.uses === 'actions/deploy-pages@v4');
      expect(deployStep?.id).toBe('deployment');
    });
  });

  describe('16. Step names are clear and descriptive', () => {
    it('should have clear step names', () => {
      const steps = workflow.jobs.deploy.steps;
      steps.forEach((step) => {
        expect(step.name).toBeDefined();
        expect(typeof step.name).toBe('string');
        expect(step.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('17. Action versions', () => {
    it('should use checkout@v5', () => {
      const steps = workflow.jobs.deploy.steps;
      const checkoutStep = steps.find((s) => s.uses?.startsWith('actions/checkout@'));
      expect(checkoutStep?.uses).toBe('actions/checkout@v5');
    });

    it('should use setup-node@v6', () => {
      const steps = workflow.jobs.deploy.steps;
      const setupStep = steps.find((s) => s.uses?.startsWith('actions/setup-node@'));
      expect(setupStep?.uses).toBe('actions/setup-node@v6');
    });

    it('should use configure-pages@v5', () => {
      const steps = workflow.jobs.deploy.steps;
      const configureStep = steps.find((s) =>
        s.uses?.startsWith('actions/configure-pages@'),
      );
      expect(configureStep?.uses).toBe('actions/configure-pages@v5');
    });

    it('should use upload-pages-artifact@v4', () => {
      const steps = workflow.jobs.deploy.steps;
      const uploadStep = steps.find((s) =>
        s.uses?.startsWith('actions/upload-pages-artifact@'),
      );
      expect(uploadStep?.uses).toBe('actions/upload-pages-artifact@v4');
    });

    it('should use deploy-pages@v4', () => {
      const steps = workflow.jobs.deploy.steps;
      const deployStep = steps.find((s) => s.uses?.startsWith('actions/deploy-pages@'));
      expect(deployStep?.uses).toBe('actions/deploy-pages@v4');
    });
  });

  describe('18. Step order', () => {
    it('should have steps in the correct order', () => {
      const steps = workflow.jobs.deploy.steps;
      const stepNames = steps.map((s) => s.name);

      expect(stepNames[0]).toBe('Checkout');
      expect(stepNames[1]).toBe('Setup Node.js');
      expect(stepNames[2]).toBe('Install dependencies');
      expect(stepNames[3]).toBe('Type check');
      expect(stepNames[4]).toBe('Lint');
      expect(stepNames[5]).toBe('Build');
      expect(stepNames[6]).toBe('Setup Pages');
      expect(stepNames[7]).toBe('Upload artifact');
      expect(stepNames[8]).toBe('Deploy to GitHub Pages');
    });
  });

  describe('19. Workflow structure completeness', () => {
    it('should have all required top-level keys', () => {
      expect(workflow.name).toBeDefined();
      expect(workflow.on).toBeDefined();
      expect(workflow.permissions).toBeDefined();
      expect(workflow.concurrency).toBeDefined();
      expect(workflow.jobs).toBeDefined();
    });
  });
});

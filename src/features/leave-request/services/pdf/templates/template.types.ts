export interface TemplateField {
  label: string;
  valuePath: string;
  position: { x: number; y: number };
  conditionalRender?: (data: unknown) => boolean;
}

export interface TemplateSection {
  title: string;
  fields: TemplateField[];
  layout?: { x: number; y: number; width: number };
}

export interface TemplateDefinition {
  pageSettings: {
    format: 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
    margins: { top: number; right: number; bottom: number; left: number };
  };
  fonts: {
    header: string;
    body: string;
    label: string;
    sizes: { small: number; normal: number; large: number; title: number };
  };
  sections: TemplateSection[];
  logo?: {
    path: string;
    position: { x: number; y: number; width: number; height: number };
  };
}

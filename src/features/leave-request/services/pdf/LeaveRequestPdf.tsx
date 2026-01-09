import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import React from 'react';
import type { PdfLanguage } from '../../state/pdfLanguage.store';
import { LeaveRequest } from '../../model/leaveRequest.types';
import translationsEn from '../../../../i18n/locales/en.json';
import translationsGr from '../../../../i18n/locales/gr.json';

// Register font with Greek support (bundled locally for offline functionality)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/Roboto-Regular.ttf',
      fontWeight: 400,
      fontStyle: 'normal',
    }, // Regular
    {
      src: '/fonts/Roboto-Italic.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    }, // Regular Italic
    {
      src: '/fonts/Roboto-Bold.ttf',
      fontWeight: 700,
      fontStyle: 'normal',
    }, // Bold
    {
      src: '/fonts/Roboto-BoldItalic.ttf',
      fontWeight: 700,
      fontStyle: 'italic',
    }, // Bold Italic
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#222',
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 25,
    borderBottomWidth: 3,
    borderBottomColor: '#1a73e8',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a73e8',
    textTransform: 'uppercase',
  },
  documentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  subject: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#444',
    textDecoration: 'underline',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    width: '48%',
  },
  rightColumn: {
    width: '48%',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a73e8',
    borderBottomWidth: 2,
    borderBottomColor: '#1a73e8',
    paddingBottom: 5,
  },
  row: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    color: '#555',
    fontWeight: 'bold',
    flex: 1,
  },
  value: {
    fontSize: 12,
    color: '#000',
    fontWeight: 700,
    flex: 1.5,
  },
  paragraph: {
    marginBottom: 12,
    textAlign: 'justify',
    lineHeight: 1.7,
  },
  footer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 4,
    maxHeight: 200,
  },
  signatureTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  signatureImage: {
    width: 145,
    height: 68,
    marginBottom: 5,
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1.5,
    borderBottomColor: '#333',
    marginTop: 5,
  },
  dateSection: {
    marginTop: 15,
    alignItems: 'flex-end',
  },
  allowanceSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d0e0ff',
  },
  allowanceText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#333',
  },
});

interface LeaveRequestPdfProps {
  data: LeaveRequest;
  absenceDays: number; // Passed as prop to avoid recalculating inside PDF
  pdfLanguage?: PdfLanguage;
}

const getPdfTranslations = (language: PdfLanguage) => {
  const translations = language === 'gr' ? translationsGr.pdf : translationsEn.pdf;
  return translations[language];
};

export const LeaveRequestPdf: React.FC<LeaveRequestPdfProps> = ({
  data,
  absenceDays,
  pdfLanguage = 'gr',
}) => {
  const t = getPdfTranslations(pdfLanguage);

  const formatDate = (date: Date | undefined) => {
    if (!date) return t.notApplicable;
    return format(date, 'dd/MM/yyyy', { locale: el });
  };

  const formatPhone = (phone: string) => {
    return phone.startsWith('+30') ? phone.replace('+30', '+30 ') : phone;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={{ fontSize: 10, color: '#666' }}>{t.toEmployer}</Text>
            <Text style={styles.companyName}>{data.profile.companyName}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>{t.requestTitle}</Text>
          </View>
        </View>

        <Text style={styles.subject}>{t.subject}</Text>

        <View style={styles.content}>
          {/* Left Column: Employee Details */}
          <View style={styles.leftColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.employeeDetails}</Text>

              <View style={styles.row}>
                <Text style={styles.label}>{t.fullName}</Text>
                <Text style={styles.value}>{data.profile.fullName}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{t.fathersName}</Text>
                <Text style={styles.value}>{data.profile.fathersName}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{t.specialty}</Text>
                <Text style={styles.value}>{data.profile.position}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{t.identityNumber}</Text>
                <Text style={styles.value}>{data.profile.identityNumber}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{t.contactPhone}</Text>
                <Text style={styles.value}>{formatPhone(data.profile.phone)}</Text>
              </View>
            </View>
          </View>

          {/* Right Column: Request Details */}
          <View style={styles.rightColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.leaveDetails}</Text>

              <Text style={styles.paragraph}>
                {t.requestText}{' '}
                <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#1a73e8' }}>
                  {absenceDays}
                </Text>{' '}
                <Text>{t.workingDays}</Text>
              </Text>

              <View style={styles.row}>
                <Text style={styles.label}>{t.from}</Text>
                <Text style={styles.value}>{formatDate(data.startDate)}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{t.to}</Text>
                <Text style={styles.value}>{formatDate(data.endDate)}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{t.reason}</Text>
                <Text style={styles.value}>{data.reason || t.personalReasons}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{t.returnDate}</Text>
                {/* Assuming return date is the day after end date, or just leave it as end date + 1 */}
                <Text style={styles.value}>
                  {data.endDate
                    ? formatDate(new Date(data.endDate.getTime() + 24 * 60 * 60 * 1000))
                    : t.notApplicable}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 20,
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          }}
        />

        {/* Allowance Information */}
        <View style={styles.allowanceSection}>
          <Text style={styles.allowanceText}>
            {data.leaveAllowance && data.leaveAllowance > 0
              ? t.wishAllowance.replace('{{days}}', String(data.leaveAllowance))
              : t.noWishAllowance}
          </Text>
        </View>

        {/* Footer / Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>{t.agreed}</Text>
            <View style={{ height: 68 }} /> {/* Space for employer signature */}
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 10 }}>{t.employer}</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>{t.applicant}</Text>
            {data.signatureDataUrl ? (
              <Image src={data.signatureDataUrl} style={styles.signatureImage} />
            ) : (
              <View style={{ height: 68 }} />
            )}
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 10 }}>{data.profile.fullName}</Text>
          </View>
        </View>

        <View style={styles.dateSection}>
          <Text style={{ fontSize: 12 }}>
            {t.date} {formatDate(data.createdAt)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};


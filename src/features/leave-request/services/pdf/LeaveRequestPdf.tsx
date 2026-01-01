import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import React from 'react';
import { LeaveRequest } from '../../model/leaveRequest.types';

// Register font with Greek support
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf',
      fontWeight: 400,
      fontStyle: 'normal',
    }, // Regular
    {
      src: 'https://fonts.gstatic.com/s/roboto/v27/KFOkCnqEu92Fr1Mu51xMIzIFKw.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    }, // Regular Italic
    {
      src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf',
      fontWeight: 700,
      fontStyle: 'normal',
    }, // Bold
    {
      src: 'https://fonts.gstatic.com/s/roboto/v27/KFOjCnqEu92Fr1Mu51TzBic3CsTKlA.ttf',
      fontWeight: 700,
      fontStyle: 'italic',
    }, // Bold Italic
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 11,
    color: '#333',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#1a73e8',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a73e8',
    textTransform: 'uppercase',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
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
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a73e8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 2,
  },
  row: {
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 11,
    color: '#000',
  },
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  footer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  signatureImage: {
    width: 120,
    height: 60,
    marginBottom: 5,
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginTop: 5,
  },
  dateSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  allowanceSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  allowanceText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
});

interface LeaveRequestPdfProps {
  data: LeaveRequest;
  absenceDays: number; // Passed as prop to avoid recalculating inside PDF
}

export const LeaveRequestPdf: React.FC<LeaveRequestPdfProps> = ({ data, absenceDays }) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return '—';
    return format(date, 'dd/MM/yyyy', { locale: el });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={{ fontSize: 10, color: '#666' }}>ΠΡΟΣ Τον εργοδότη:</Text>
            <Text style={styles.companyName}>{data.profile.companyName}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>ΑΙΤΗΣΗ</Text>
          </View>
        </View>

        <Text style={styles.subject}>ΘΕΜΑ: Χορήγηση Κανονικής Άδειας</Text>

        <View style={styles.content}>
          {/* Left Column: Employee Details */}
          <View style={styles.leftColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Στοιχεία Εργαζομένου</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Ονοματεπώνυμο:</Text>
                <Text style={styles.value}>{data.profile.fullName}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Πατρώνυμο:</Text>
                <Text style={styles.value}>{data.profile.fathersName}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Ειδικότητα:</Text>
                <Text style={styles.value}>{data.profile.position}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>ΑΔΤ:</Text>
                <Text style={styles.value}>{data.profile.identityNumber}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Τηλ. Επικοινωνίας:</Text>
                <Text style={styles.value}>{data.profile.phone}</Text>
              </View>

              {data.profile.employeeId && (
                <View style={styles.row}>
                  <Text style={styles.label}>Αρ. Μητρώου:</Text>
                  <Text style={styles.value}>{data.profile.employeeId}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Right Column: Request Details */}
          <View style={styles.rightColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Λεπτομέρειες Αδείας</Text>

              <Text style={styles.paragraph}>
                Παρακαλώ να μου χορηγήσετε κανονική άδεια απουσίας{' '}
                <Text style={{ fontWeight: 'bold' }}>{absenceDays}</Text>{' '}
                εργάσιμων ημερών.
              </Text>

              <View style={styles.row}>
                <Text style={styles.label}>Από:</Text>
                <Text style={styles.value}>{formatDate(data.startDate)}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Έως (και):</Text>
                <Text style={styles.value}>{formatDate(data.endDate)}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Λόγος:</Text>
                <Text style={styles.value}>{data.reason || 'Προσωπικοί λόγοι'}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Ημερομηνία Επιστροφής:</Text>
                {/* Assuming return date is the day after end date, or just leave it as end date + 1 */}
                <Text style={styles.value}>
                  {data.endDate
                    ? formatDate(new Date(data.endDate.getTime() + 24 * 60 * 60 * 1000))
                    : '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Allowance Preference */}
        <View style={styles.allowanceSection}>
          <Text style={styles.allowanceText}>
            {data.leaveAllowance
              ? 'ΕΠΙΘΥΜΩ αναλογία επιδόματος αδείας.'
              : 'ΔΕΝ ΕΠΙΘΥΜΩ αναλογία επιδόματος αδείας.'}
          </Text>
        </View>

        {/* Footer / Signatures */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Συμφωνώ</Text>
            <View style={{ height: 60 }} /> {/* Space for employer signature */}
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 10 }}>Ο Εργοδότης</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Ο Αιτών / Η Αιτούσα</Text>
            {data.signatureDataUrl ? (
              <Image src={data.signatureDataUrl} style={styles.signatureImage} />
            ) : (
              <View style={{ height: 60 }} />
            )}
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 10 }}>{data.profile.fullName}</Text>
          </View>
        </View>

        <View style={styles.dateSection}>
          <Text style={{ fontSize: 10 }}>Ημερομηνία: {formatDate(data.createdAt)}</Text>
        </View>
      </Page>
    </Document>
  );
};

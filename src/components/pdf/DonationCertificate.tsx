import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
    paddingBottom: 20,
  },
  orgName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#16a34a",
  },
  orgTagline: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 30,
  },
  certBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    width: 140,
    fontSize: 10,
    color: "#6b7280",
  },
  value: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  amount: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#16a34a",
    textAlign: "center",
    marginVertical: 12,
  },
  amountLabel: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerLeft: {
    flex: 1,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
    marginBottom: 3,
  },
  signatureArea: {
    alignItems: "center",
    width: 140,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    width: 120,
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  badge: {
    backgroundColor: "#dcfce7",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 9,
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
  },
});

interface DonationCertificateProps {
  donorName: string;
  amount: number;
  campaignTitle: string;
  transactionId: string;
  date: string;
  isZakat?: boolean;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export default function DonationCertificate({
  donorName,
  amount,
  campaignTitle,
  transactionId,
  date,
  isZakat = false,
}: DonationCertificateProps) {
  return (
    <Document title={`Sertifikat Donasi - ${donorName}`} author="LAZIS NUR">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.orgName}>LAZIS NUR</Text>
            <Text style={styles.orgTagline}>Lembaga Amil Zakat Infaq dan Shadaqah</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{isZakat ? "Sertifikat Zakat" : "Sertifikat Donasi"}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isZakat ? "SERTIFIKAT PEMBAYARAN ZAKAT" : "SERTIFIKAT DONASI"}
        </Text>
        <Text style={styles.subtitle}>
          Dengan ini kami menyatakan bahwa donatur berikut telah melakukan{" "}
          {isZakat ? "pembayaran zakat" : "donasi"} melalui platform DonasiKebaikan LAZIS NUR
        </Text>

        {/* Certificate Body */}
        <View style={styles.certBox}>
          <Text style={styles.amountLabel}>Jumlah {isZakat ? "Zakat" : "Donasi"}</Text>
          <Text style={styles.amount}>{formatRupiah(amount)}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Nama Donatur</Text>
            <Text style={styles.value}>{donorName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Program / Campaign</Text>
            <Text style={styles.value}>{campaignTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ID Transaksi</Text>
            <Text style={styles.value}>{transactionId}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>Sertifikat ini sah secara digital dan tidak memerlukan tanda tangan basah.</Text>
            <Text style={styles.footerText}>Diterbitkan oleh: LAZIS NUR · donasikebaikan.id</Text>
            <Text style={styles.footerText}>Tanggal cetak: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</Text>
          </View>
          <View style={styles.signatureArea}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Direktur LAZIS NUR</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const G = "#2d7d32";
const D = "#111111";
const GR = "#555555";
const BD = "#bbbbbb";
const R = "#c62828";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingVertical: 16,
    fontFamily: "Helvetica",
    fontSize: 8,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: G,
    paddingBottom: 8,
    marginBottom: 6,
  },
  logo: { width: 80, height: 30, objectFit: "contain", marginRight: 10 },
  orgBlock: { flex: 1 },
  orgTagline: { fontSize: 6.5, color: GR, fontStyle: "italic", marginTop: 1 },
  orgAddress: { fontSize: 6, color: GR, marginTop: 1 },
  headerRight: { width: 170 },
  licLine: { fontSize: 6.5, color: D, marginBottom: 1 },
  licBold: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: D, marginBottom: 1 },

  // TITLE
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textDecoration: "underline",
    color: D,
    marginBottom: 8,
    marginTop: 2,
  },

  // BODY - two columns
  body: { flexDirection: "row" },
  leftCol: {
    width: "44%",
    paddingRight: 10,
    borderRightWidth: 0.5,
    borderRightColor: BD,
  },
  rightCol: { flex: 1, paddingLeft: 10 },

  // LEFT: field rows
  fr: { flexDirection: "row", marginBottom: 5 },
  fl: { width: 72, fontSize: 7.5, color: D },
  fc: { width: 7, fontSize: 7.5, color: D },
  fv: { flex: 1, fontSize: 7.5, color: D },
  fvb: { flex: 1, fontSize: 7.5, fontFamily: "Helvetica-Bold", color: D },

  // Jenis Dana checkbox
  jenisDanaWrap: { flex: 1, flexDirection: "row", alignItems: "center" },
  checkBox: {
    width: 9, height: 9,
    borderWidth: 0.75, borderColor: D,
    marginRight: 3,
    alignItems: "center", justifyContent: "center",
  },
  checkMark: { fontSize: 7, color: D, lineHeight: 1 },
  jLabel: { fontSize: 7.5, color: D, marginRight: 10 },
  bankPill: {
    borderWidth: 0.5, borderColor: BD,
    paddingHorizontal: 4, paddingVertical: 1,
    marginLeft: 4,
  },
  bankPillText: { fontSize: 7, color: D },

  // LEFT: signatures
  sigArea: { flexDirection: "row", marginTop: 16 },
  sigBox: { flex: 1, alignItems: "center" },
  sigLabel: { fontSize: 6.5, color: D, textAlign: "center", marginBottom: 22 },
  sigName: {
    fontSize: 8, fontFamily: "Helvetica-Bold",
    color: D, textAlign: "center",
    borderTopWidth: 0.5, borderTopColor: D,
    paddingTop: 2, width: "80%",
  },
  sigOrgLogo: { width: 50, height: 18, objectFit: "contain", marginBottom: 2 },

  // RIGHT: table
  table: { borderWidth: 0.5, borderColor: BD },
  tHead: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 0.5, borderBottomColor: BD,
  },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BD },
  tRowLast: { flexDirection: "row" },
  cNo: {
    width: 18, paddingVertical: 3, paddingHorizontal: 2,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7, textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  cJenis: {
    width: 130, paddingVertical: 3, paddingHorizontal: 3,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7,
  },
  cKet: {
    flex: 1, paddingVertical: 3, paddingHorizontal: 3,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7,
  },
  cJml: {
    width: 90, paddingVertical: 3, paddingHorizontal: 4,
    fontSize: 7, textAlign: "right",
  },
  cNoH: {
    width: 18, paddingVertical: 3, paddingHorizontal: 2,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7, textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  cJenisH: {
    width: 130, paddingVertical: 3, paddingHorizontal: 3,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7, fontFamily: "Helvetica-Bold",
  },
  cKetH: {
    flex: 1, paddingVertical: 3, paddingHorizontal: 3,
    borderRightWidth: 0.5, borderRightColor: BD,
    fontSize: 7, fontFamily: "Helvetica-Bold",
  },
  cJmlH: {
    width: 90, paddingVertical: 3, paddingHorizontal: 4,
    fontSize: 7, fontFamily: "Helvetica-Bold", textAlign: "right",
  },

  // Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 1, borderTopColor: D,
    paddingTop: 3, marginTop: 1, marginBottom: 5,
  },
  totalLabel: {
    fontSize: 8.5, fontFamily: "Helvetica-Bold", color: D,
    paddingRight: 8,
  },
  totalVal: {
    width: 90, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: D, textAlign: "right",
  },

  // Terbilang
  tbLabel: { fontSize: 7, color: GR, marginBottom: 1 },
  tbBox: { borderWidth: 0.5, borderColor: BD, padding: 4, marginBottom: 5 },
  tbText: { fontSize: 8, fontStyle: "italic", color: D },

  noteSmall: { fontSize: 6.5, color: GR, fontStyle: "italic", marginBottom: 4 },

  // Doa box
  doaBox: { borderWidth: 0.5, borderColor: BD, padding: 6, marginTop: 4 },
  doaArabic: { fontSize: 7, textAlign: "center", fontStyle: "italic", color: D, marginBottom: 3 },
  doaTrans: { fontSize: 6.5, color: GR, textAlign: "justify" },

  // Footer
  footerRed: { fontSize: 6.5, color: R, fontStyle: "italic", marginTop: 6 },
});

function fmt(amount: number): string {
  return (
    "Rp " +
    amount.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

const EMPTY_ROWS = 5;
const DASH = "-";

export interface DonationReceiptProps {
  donorName: string;
  donorPhone: string;
  amount: number;
  campaignTitle: string;
  transactionId: string;
  date: string;
  receiptNumber: string;
  donorId: string;
  paymentType: "bank" | "tunai";
  bankInfo: string;
  jenisdonasi: string;
  terbilang: string;
  logoPath: string;
}

export default function DonationReceipt({
  donorName,
  donorPhone,
  amount,
  campaignTitle,
  transactionId,
  date,
  receiptNumber,
  donorId,
  paymentType,
  bankInfo,
  jenisdonasi,
  terbilang,
  logoPath,
}: DonationReceiptProps) {
  const isBank = paymentType === "bank";

  return (
    <Document title={`Bukti Terima Donasi - ${donorName}`} author="LAZISNUR">
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          {/* Left: Logo + address */}
          <Image src={logoPath} style={s.logo} />
          <View style={s.orgBlock}>
            <Text style={s.orgTagline}>Mencerdaskan memberdayakan</Text>
            <Text style={s.orgAddress}>
              Komplek Ruko Sabar Ganda Blok C No.6, Jl. KSR Dadi Kusmayadi{"\n"}
              Kel. Tengah Kec. Cibinong Bogor
            </Text>
          </View>

          {/* Right: License info */}
          <View style={s.headerRight}>
            <Text style={s.licBold}>Izin Operasional :</Text>
            <Text style={s.licLine}>Nomor 910 Tahun 2023 Tanggal 16 Oktober 2023</Text>
            <Text style={s.licLine}>Kementerian Agama Prov. Jawa Barat</Text>
            <Text style={s.licLine}>Dirjen Pajak : Nomor Per-4/PJ/2026</Text>
            <Text style={s.licLine}>Terakreditasi A</Text>
            <Text style={s.licLine}>Member of FOZ Nomor Anggota : 119.FOZ.2019</Text>
          </View>
        </View>

        {/* ── TITLE ── */}
        <Text style={s.title}>BUKTI TERIMA DONASI</Text>

        {/* ── BODY ── */}
        <View style={s.body}>

          {/* ─── LEFT COLUMN ─── */}
          <View style={s.leftCol}>
            <View style={s.fr}>
              <Text style={s.fl}>No. Kwitansi</Text>
              <Text style={s.fc}>:</Text>
              <Text style={s.fv}>{receiptNumber}</Text>
            </View>
            <View style={s.fr}>
              <Text style={s.fl}>ID Transaksi</Text>
              <Text style={s.fc}>:</Text>
              <Text style={s.fv}>{donorId}</Text>
            </View>
            <View style={s.fr}>
              <Text style={s.fl}>Nama Donatur</Text>
              <Text style={s.fc}>:</Text>
              <Text style={s.fvb}>{donorName}</Text>
            </View>
            <View style={s.fr}>
              <Text style={s.fl}>No. HP / WA</Text>
              <Text style={s.fc}>:</Text>
              <Text style={s.fv}>{donorPhone || DASH}</Text>
            </View>
            <View style={s.fr}>
              <Text style={s.fl}>Jenis Dana</Text>
              <Text style={s.fc}>:</Text>
              <View style={s.jenisDanaWrap}>
                {/* Tunai checkbox */}
                <View style={s.checkBox}>
                  {!isBank && <Text style={s.checkMark}>x</Text>}
                </View>
                <Text style={s.jLabel}>Tunai</Text>
                {/* Bank checkbox */}
                <View style={s.checkBox}>
                  {isBank && <Text style={s.checkMark}>x</Text>}
                </View>
                <Text style={s.jLabel}>Bank</Text>
                {isBank && bankInfo && (
                  <View style={s.bankPill}>
                    <Text style={s.bankPillText}>{bankInfo}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={s.fr}>
              <Text style={s.fl}>Tanggal</Text>
              <Text style={s.fc}>:</Text>
              <Text style={s.fv}>{date}</Text>
            </View>
            <View style={s.fr}>
              <Text style={s.fl}>No. Transaksi</Text>
              <Text style={s.fc}>:</Text>
              <Text style={s.fv}>{transactionId}</Text>
            </View>

            {/* Signatures */}
            <View style={s.sigArea}>
              <View style={s.sigBox}>
                <Text style={s.sigLabel}>Penyetor / Donatur</Text>
                <Text style={s.sigName}>{donorName}</Text>
              </View>
              <View style={s.sigBox}>
                <Text style={s.sigLabel}>Diterima Oleh</Text>
                <Image src={logoPath} style={s.sigOrgLogo} />
                <Text style={s.sigName}>LAZISNUR</Text>
              </View>
            </View>
          </View>

          {/* ─── RIGHT COLUMN ─── */}
          <View style={s.rightCol}>

            {/* Table */}
            <View style={s.table}>
              {/* Header */}
              <View style={s.tHead}>
                <Text style={s.cNoH}>No.</Text>
                <Text style={s.cJenisH}>JENIS DONASI</Text>
                <Text style={s.cKetH}>KETERANGAN</Text>
                <Text style={s.cJmlH}>JUMLAH</Text>
              </View>

              {/* Row 1 - filled */}
              <View style={s.tRow}>
                <Text style={s.cNo}>1</Text>
                <Text style={s.cJenis}>{jenisdonasi}</Text>
                <Text style={s.cKet}>{campaignTitle}</Text>
                <Text style={s.cJml}>{fmt(amount)}</Text>
              </View>

              {/* Empty rows */}
              {Array.from({ length: EMPTY_ROWS }).map((_, i) => {
                const isLast = i === EMPTY_ROWS - 1;
                return (
                  <View key={i} style={isLast ? s.tRowLast : s.tRow}>
                    <Text style={s.cNo}>{i + 2}</Text>
                    <Text style={s.cJenis}>{DASH}</Text>
                    <Text style={s.cKet}>{DASH}</Text>
                    <Text style={s.cJml}>{DASH}</Text>
                  </View>
                );
              })}
            </View>

            {/* Total */}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalVal}>{fmt(amount)}</Text>
            </View>

            {/* Terbilang */}
            <Text style={s.tbLabel}>Terbilang:</Text>
            <View style={s.tbBox}>
              <Text style={s.tbText}>{terbilang}</Text>
            </View>

            {/* Note */}
            <Text style={s.noteSmall}>
              *Setiap Infaq Program sudah termasuk operasional lembaga 20%
            </Text>

            {/* Doa */}
            <View style={s.doaBox}>
              <Text style={s.doaArabic}>
                Ajarakallahu fiimaa a&apos;thayta, wa baaraka fiimaa abqayta wa ja&apos;alahu laka thohuuron
              </Text>
              <Text style={s.doaTrans}>
                Semoga Allah memberikan pahala kepadamu pada barang yang engkau berikan (zakatkan) dan semoga
                Allah memberkahimu dalam harta-harta yang masih engkau sisakan dan semoga pula menjadikannya
                sebagai pembersih (dosa) bagimu.
              </Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER NOTE ── */}
        <Text style={s.footerRed}>
          *) Bahwa sumber dana donasi sudah sesuai haul dan nisab, berasal dari sumber dana halal, tidak
          bertentangan dengan peraturan yang berlaku dan bukan merupakan pencucian uang.
        </Text>
      </Page>
    </Document>
  );
}

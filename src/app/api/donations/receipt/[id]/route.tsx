import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer, type DocumentProps, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

/* ──────────────────────────────────────────────
   HELPER FUNCTIONS
────────────────────────────────────────────── */
function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function fmtRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function mkReceiptNo(createdAt: string, id: string): string {
  const d = new Date(createdAt);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

function terbilang(n: number): string {
  if (n === 0) return "Nol Rupiah";
  const satuan = ["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan",
    "sepuluh","sebelas","dua belas","tiga belas","empat belas","lima belas","enam belas",
    "tujuh belas","delapan belas","sembilan belas"];
  function w(x: number): string {
    if (x === 0) return "";
    if (x < 20) return satuan[x];
    if (x < 100) {
      const t=["","","dua puluh","tiga puluh","empat puluh","lima puluh","enam puluh","tujuh puluh","delapan puluh","sembilan puluh"][Math.floor(x/10)];
      const o=x%10; return o===0?t:`${t} ${satuan[o]}`;
    }
    if (x < 1000) { const h=Math.floor(x/100),r=x%100,hw=h===1?"seratus":`${satuan[h]} ratus`; return r===0?hw:`${hw} ${w(r)}`; }
    if (x < 1_000_000) { const k=Math.floor(x/1000),r=x%1000,kw=k===1?"seribu":`${w(k)} ribu`; return r===0?kw:`${kw} ${w(r)}`; }
    if (x < 1_000_000_000) { const m=Math.floor(x/1_000_000),r=x%1_000_000,mw=`${w(m)} juta`; return r===0?mw:`${mw} ${w(r)}`; }
    const b=Math.floor(x/1_000_000_000),r=x%1_000_000_000,bw=`${w(b)} miliar`; return r===0?bw:`${bw} ${w(r)}`;
  }
  const words = w(Math.round(n)); return words.charAt(0).toUpperCase()+words.slice(1)+" Rupiah";
}

function jenisDonasi(slug: string|null|undefined): string {
  if (!slug) return "Infak/Sedekah Tidak Terikat";
  if (slug.includes("zakat")) return "Zakat Mal";
  if (slug.includes("fidyah")) return "Fidyah";
  if (slug.includes("wakaf")) return "Wakaf";
  if (slug.includes("qurban")||slug.includes("kurban")) return "Qurban";
  return "Infak/Sedekah Tidak Terikat";
}

/* ──────────────────────────────────────────────
   PDF STYLES
────────────────────────────────────────────── */
const G="#2d7d32", D="#111111", GR="#555555", BD="#bbbbbb", R="#c62828";

const s = StyleSheet.create({
  page:{ backgroundColor:"#fff", paddingHorizontal:22, paddingVertical:16, fontFamily:"Helvetica", fontSize:8 },
  header:{ flexDirection:"row", alignItems:"flex-start", borderBottomWidth:2, borderBottomColor:G, paddingBottom:8, marginBottom:6 },
  logo:{ width:80, height:30, objectFit:"contain", marginRight:10 },
  orgBlock:{ flex:1 },
  orgTagline:{ fontSize:6.5, color:GR, fontStyle:"italic", marginTop:1 },
  orgAddress:{ fontSize:6, color:GR, marginTop:1 },
  headerRight:{ width:170 },
  licBold:{ fontSize:6.5, fontFamily:"Helvetica-Bold", color:D, marginBottom:1 },
  licLine:{ fontSize:6.5, color:D, marginBottom:0.5 },
  title:{ fontSize:14, fontFamily:"Helvetica-Bold", textAlign:"center", textDecoration:"underline", color:D, marginBottom:8, marginTop:2 },
  body:{ flexDirection:"row" },
  leftCol:{ width:"44%", paddingRight:10, borderRightWidth:0.5, borderRightColor:BD },
  rightCol:{ flex:1, paddingLeft:10 },
  fr:{ flexDirection:"row", marginBottom:5 },
  fl:{ width:72, fontSize:7.5, color:D },
  fc:{ width:7, fontSize:7.5, color:D },
  fv:{ flex:1, fontSize:7.5, color:D },
  fvb:{ flex:1, fontSize:7.5, fontFamily:"Helvetica-Bold", color:D },
  jRow:{ flex:1, flexDirection:"row", alignItems:"center" },
  chk:{ width:9, height:9, borderWidth:0.75, borderColor:D, marginRight:3, alignItems:"center", justifyContent:"center" },
  chkMark:{ fontSize:7, color:D },
  jLbl:{ fontSize:7.5, color:D, marginRight:10 },
  pill:{ borderWidth:0.5, borderColor:BD, paddingHorizontal:4, paddingVertical:1, marginLeft:4 },
  pillTxt:{ fontSize:7, color:D },
  sigArea:{ flexDirection:"row", marginTop:16 },
  sigBox:{ flex:1, alignItems:"center" },
  sigLbl:{ fontSize:6.5, color:D, textAlign:"center", marginBottom:22 },
  sigLogo:{ width:50, height:18, objectFit:"contain", marginBottom:2 },
  sigName:{ fontSize:8, fontFamily:"Helvetica-Bold", color:D, textAlign:"center", borderTopWidth:0.5, borderTopColor:D, paddingTop:2, width:"80%" },
  table:{ borderWidth:0.5, borderColor:BD },
  tHead:{ flexDirection:"row", backgroundColor:"#f0f0f0", borderBottomWidth:0.5, borderBottomColor:BD },
  tRow:{ flexDirection:"row", borderBottomWidth:0.5, borderBottomColor:BD },
  tRowLast:{ flexDirection:"row" },
  cNoH:{ width:18, paddingVertical:3, paddingHorizontal:2, borderRightWidth:0.5, borderRightColor:BD, fontSize:7, textAlign:"center", fontFamily:"Helvetica-Bold" },
  cJenisH:{ width:130, paddingVertical:3, paddingHorizontal:3, borderRightWidth:0.5, borderRightColor:BD, fontSize:7, fontFamily:"Helvetica-Bold" },
  cKetH:{ flex:1, paddingVertical:3, paddingHorizontal:3, borderRightWidth:0.5, borderRightColor:BD, fontSize:7, fontFamily:"Helvetica-Bold" },
  cJmlH:{ width:90, paddingVertical:3, paddingHorizontal:4, fontSize:7, fontFamily:"Helvetica-Bold", textAlign:"right" },
  cNo:{ width:18, paddingVertical:3, paddingHorizontal:2, borderRightWidth:0.5, borderRightColor:BD, fontSize:7, textAlign:"center" },
  cJenis:{ width:130, paddingVertical:3, paddingHorizontal:3, borderRightWidth:0.5, borderRightColor:BD, fontSize:7 },
  cKet:{ flex:1, paddingVertical:3, paddingHorizontal:3, borderRightWidth:0.5, borderRightColor:BD, fontSize:7 },
  cJml:{ width:90, paddingVertical:3, paddingHorizontal:4, fontSize:7, textAlign:"right" },
  totalRow:{ flexDirection:"row", justifyContent:"flex-end", alignItems:"center", borderTopWidth:1, borderTopColor:D, paddingTop:3, marginTop:1, marginBottom:5 },
  totalLbl:{ fontSize:8.5, fontFamily:"Helvetica-Bold", color:D, paddingRight:8 },
  totalVal:{ width:90, fontSize:8.5, fontFamily:"Helvetica-Bold", color:D, textAlign:"right" },
  tbLbl:{ fontSize:7, color:GR, marginBottom:1 },
  tbBox:{ borderWidth:0.5, borderColor:BD, padding:4, marginBottom:5 },
  tbTxt:{ fontSize:8, fontStyle:"italic", color:D },
  noteSmall:{ fontSize:6.5, color:GR, fontStyle:"italic", marginBottom:4 },
  doaBox:{ borderWidth:0.5, borderColor:BD, padding:6, marginTop:4 },
  doaArabic:{ fontSize:7, textAlign:"center", fontStyle:"italic", color:D, marginBottom:3 },
  doaTrans:{ fontSize:6.5, color:GR, textAlign:"justify" },
  footerRed:{ fontSize:6.5, color:R, fontStyle:"italic", marginTop:6 },
});

/* ──────────────────────────────────────────────
   PDF COMPONENT (inline — no separate import)
────────────────────────────────────────────── */
interface ReceiptProps {
  donorName: string; donorPhone: string; amount: number;
  campaignTitle: string; transactionId: string; date: string;
  receiptNo: string; donorId: string; bankInfo: string;
  jenis: string; tb: string; logo: string;
}

function BuktiTerimaDonasi(p: ReceiptProps) {
  const EMPTY = 5;
  return (
    <Document title={`Bukti Terima Donasi - ${p.donorName}`} author="LAZISNUR">
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* HEADER */}
        <View style={s.header}>
          {p.logo
            ? <Image src={p.logo} style={s.logo} />
            : <Text style={{ fontSize:16, fontFamily:"Helvetica-Bold", color:G, marginRight:10, width:80 }}>LAZISNUR</Text>
          }
          <View style={s.orgBlock}>
            <Text style={s.orgTagline}>Mencerdaskan memberdayakan</Text>
            <Text style={s.orgAddress}>Komplek Ruko Sabar Ganda Blok C No.6, Jl. KSR Dadi Kusmayadi{"\n"}Kel. Tengah Kec. Cibinong Bogor</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.licBold}>Izin Operasional :</Text>
            <Text style={s.licLine}>Nomor 910 Tahun 2023 Tanggal 16 Oktober 2023</Text>
            <Text style={s.licLine}>Kementerian Agama Prov. Jawa Barat</Text>
            <Text style={s.licLine}>Dirjen Pajak : Nomor Per-4/PJ/2026</Text>
            <Text style={s.licLine}>Terakreditasi A</Text>
            <Text style={s.licLine}>Member of FOZ Nomor Anggota : 119.FOZ.2019</Text>
          </View>
        </View>

        {/* TITLE */}
        <Text style={s.title}>BUKTI TERIMA DONASI</Text>

        {/* BODY */}
        <View style={s.body}>
          {/* LEFT */}
          <View style={s.leftCol}>
            {([
              ["No. Kwitansi", p.receiptNo, false],
              ["ID Transaksi", p.donorId, false],
              ["Nama Donatur", p.donorName, true],
              ["No. HP / WA", p.donorPhone || "-", false],
              ["Tanggal", p.date, false],
              ["No. Ref", p.transactionId, false],
            ] as [string, string, boolean][]).map(([lbl, val, bold]) => (
              <View key={lbl} style={s.fr}>
                <Text style={s.fl}>{lbl}</Text>
                <Text style={s.fc}>:</Text>
                <Text style={bold ? s.fvb : s.fv}>{val}</Text>
              </View>
            ))}

            {/* Jenis Dana */}
            <View style={s.fr}>
              <Text style={s.fl}>Jenis Dana</Text>
              <Text style={s.fc}>:</Text>
              <View style={s.jRow}>
                <View style={s.chk}><Text style={s.chkMark}> </Text></View>
                <Text style={s.jLbl}>Tunai</Text>
                <View style={s.chk}><Text style={s.chkMark}>x</Text></View>
                <Text style={s.jLbl}>Bank</Text>
                {p.bankInfo ? <View style={s.pill}><Text style={s.pillTxt}>{p.bankInfo}</Text></View> : null}
              </View>
            </View>

            {/* Signatures */}
            <View style={s.sigArea}>
              <View style={s.sigBox}>
                <Text style={s.sigLbl}>Penyetor / Donatur</Text>
                <Text style={s.sigName}>{p.donorName}</Text>
              </View>
              <View style={s.sigBox}>
                <Text style={s.sigLbl}>Diterima Oleh</Text>
                {p.logo ? <Image src={p.logo} style={s.sigLogo} /> : null}
                <Text style={s.sigName}>LAZISNUR</Text>
              </View>
            </View>
          </View>

          {/* RIGHT */}
          <View style={s.rightCol}>
            <View style={s.table}>
              <View style={s.tHead}>
                <Text style={s.cNoH}>No.</Text>
                <Text style={s.cJenisH}>JENIS DONASI</Text>
                <Text style={s.cKetH}>KETERANGAN</Text>
                <Text style={s.cJmlH}>JUMLAH</Text>
              </View>
              <View style={s.tRow}>
                <Text style={s.cNo}>1</Text>
                <Text style={s.cJenis}>{p.jenis}</Text>
                <Text style={s.cKet}>{p.campaignTitle}</Text>
                <Text style={s.cJml}>{fmtRupiah(p.amount)}</Text>
              </View>
              {Array.from({ length: EMPTY }).map((_, i) => (
                <View key={i} style={i === EMPTY-1 ? s.tRowLast : s.tRow}>
                  <Text style={s.cNo}>{i+2}</Text>
                  <Text style={s.cJenis}>-</Text>
                  <Text style={s.cKet}>-</Text>
                  <Text style={s.cJml}>-</Text>
                </View>
              ))}
            </View>

            <View style={s.totalRow}>
              <Text style={s.totalLbl}>Total</Text>
              <Text style={s.totalVal}>{fmtRupiah(p.amount)}</Text>
            </View>

            <Text style={s.tbLbl}>Terbilang:</Text>
            <View style={s.tbBox}><Text style={s.tbTxt}>{p.tb}</Text></View>
            <Text style={s.noteSmall}>*Setiap Infaq Program sudah termasuk operasional lembaga 20%</Text>

            <View style={s.doaBox}>
              <Text style={s.doaArabic}>Ajarakallahu fiimaa a'thayta, wa baaraka fiimaa abqayta wa ja'alahu laka thohuuron</Text>
              <Text style={s.doaTrans}>Semoga Allah memberikan pahala kepadamu pada barang yang engkau berikan dan semoga Allah memberkahimu dalam harta yang masih engkau sisakan serta menjadikannya sebagai pembersih (dosa) bagimu.</Text>
            </View>
          </View>
        </View>

        <Text style={s.footerRed}>*) Bahwa sumber dana donasi berasal dari sumber dana halal, tidak bertentangan dengan peraturan yang berlaku dan bukan merupakan pencucian uang.</Text>
      </Page>
    </Document>
  );
}

/* ──────────────────────────────────────────────
   ROUTE HANDLER
────────────────────────────────────────────── */
type CampaignJoin = { title: string; categories: { slug: string } | null } | null;
interface BankAccount { bank: string; number: string; holder: string }

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const [{ data: donation, error }, { data: settingsRows }] = await Promise.all([
    supabase
      .from("donations")
      .select("id, donor_name, donor_phone, is_anonymous, amount, status, transaction_id, created_at, payment_method, campaigns(title, categories(slug))")
      .eq("id", id)
      .single(),
    supabase.from("site_settings").select("key, value"),
  ]);

  if (error || !donation) {
    return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
  }
  if (donation.status !== "success") {
    return NextResponse.json({ error: "Bukti hanya tersedia setelah donasi diverifikasi" }, { status: 400 });
  }

  const settings: Record<string, string> = {};
  for (const row of settingsRows ?? []) settings[row.key] = row.value;

  let banks: BankAccount[] = [];
  try { banks = JSON.parse(settings.bank_accounts ?? "[]"); } catch { /* empty */ }
  const firstBank = banks[0];
  const bankInfo = firstBank ? `${firstBank.bank} ${firstBank.number}` : "";

  const campaign = donation.campaigns as unknown as CampaignJoin;
  const donorName = donation.is_anonymous ? "Hamba Allah" : (donation.donor_name ?? "");

  // Logo as base64
  let logo = "";
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
    logo = `data:image/png;base64,${buf.toString("base64")}`;
  } catch { /* logo optional */ }

  const props: ReceiptProps = {
    donorName,
    donorPhone: (donation.donor_phone as string | null) ?? "",
    amount: donation.amount as number,
    campaignTitle: campaign?.title ?? "Program LAZISNUR",
    transactionId: (donation.transaction_id as string | null) ?? (donation.id as string),
    date: fmtDate(donation.created_at as string),
    receiptNo: mkReceiptNo(donation.created_at as string, donation.id as string),
    donorId: (donation.id as string).slice(0, 8).toUpperCase(),
    bankInfo,
    jenis: jenisDonasi(campaign?.categories?.slug),
    tb: terbilang(donation.amount as number),
    logo,
  };

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(createElement(BuktiTerimaDonasi, props) as ReactElement<DocumentProps>);
  } catch (err) {
    console.error("[receipt] PDF error:", err);
    return NextResponse.json({ error: "Gagal membuat PDF" }, { status: 500 });
  }

  const filename = `bukti-terima-donasi-${(donation.id as string).slice(0, 8)}.pdf`;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

// Suppress randomUUID unused warning
void randomUUID;

import DonationCertificate from "./DonationCertificate";

interface ZakatCertificateProps {
  donorName: string;
  amount: number;
  campaignTitle: string;
  transactionId: string;
  date: string;
  zakatType?: "maal" | "fitrah" | "penghasilan";
}

export default function ZakatCertificate(props: ZakatCertificateProps) {
  const titleMap = {
    maal: "Zakat Maal",
    fitrah: "Zakat Fitrah",
    penghasilan: "Zakat Penghasilan",
  };

  const campaignTitle = props.zakatType
    ? `${titleMap[props.zakatType]} - ${props.campaignTitle}`
    : props.campaignTitle;

  return (
    <DonationCertificate
      {...props}
      campaignTitle={campaignTitle}
      isZakat
    />
  );
}

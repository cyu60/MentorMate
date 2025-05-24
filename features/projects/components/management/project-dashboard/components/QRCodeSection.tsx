import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";

interface QRCodeSectionProps {
  fullUrl: string;
  onCopyQR: () => void;
  onDownloadQR: () => void;
}

export function QRCodeSection({ fullUrl, onCopyQR, onDownloadQR }: QRCodeSectionProps) {
  return (
    <div className="flex flex-col items-center w-full md:w-auto md:items-start">
      <div className="bg-white p-4 rounded-lg shadow-md mx-auto md:mx-0">
        <QRCode value={fullUrl} size={200} id="project-qr-code" />
      </div>
      <div className="mt-4 space-y-2 w-full">
        <p className="text-sm text-gray-700 text-center md:text-left">
          Scan this QR code to provide feedback
        </p>
        <div className="flex gap-2 justify-center md:justify-start">
          <Button
            onClick={onCopyQR}
            variant="outline"
            className="hidden md:flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
          <Button
            onClick={onDownloadQR}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
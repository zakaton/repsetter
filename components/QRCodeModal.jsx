/* eslint-disable react/destructuring-assignment */
import Modal from "./Modal";
import { useQRCode } from "next-qrcode";

export default function QRCodeModal(props) {
  const { text } = props;
  const { Image } = useQRCode();

  return (
    <Modal
      {...props}
      message="Show this to someone with a QR Code reader, or take a screenshot"
    >
      <div className="mt-0 mb-0 flex justify-center">
        <Image
          text={text}
          alt="QR Code leading to this page"
          options={{
            type: "image/jpeg",
            quality: 0.3,
            level: "M",
            margin: 2,
            scale: 4,
            width: 250,
          }}
        />
      </div>
    </Modal>
  );
}

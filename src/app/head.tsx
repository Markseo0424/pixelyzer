export default function Head() {
  // NOTE:
  // 실제 배포 전에 .env.local 등에 아래 환경 변수를 설정해야 합니다.
  //   NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
  // 값이 없으면 광고 스크립트를 로드하지 않습니다.
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <>
      {client && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}

import VerifyCode from '@/components/VerifyCode';

// Force dynamic rendering for search params (email parameter)
export const dynamic = 'force-dynamic';

export default function VerifyCodePage() {
  return <VerifyCode />;
}

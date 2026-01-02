import HorizonAdminLayout from '@/components/HorizonAdminLayout';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <HorizonAdminLayout>{children}</HorizonAdminLayout>;
}

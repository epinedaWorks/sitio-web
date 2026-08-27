import AdminBar from "./AdminBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminBar />
      {children}
    </>
  );
}

import UploadData from '@/components/upload';

export default function DashboardUploadPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Files</h1>
      <UploadData />
    </div>
  );
}
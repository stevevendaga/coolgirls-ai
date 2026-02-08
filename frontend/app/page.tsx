import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import ProtectedLayout from './protected-layout';
import Twin from '@/components/twin';

export default function Home() {
  return (
    <>
      <SignedIn>
        <ProtectedLayout>
          <main className="min-h-screen flex flex-col bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto mt-9">
                  <Twin />
                </div>
              </div>
            </div>
          </main>
        </ProtectedLayout>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
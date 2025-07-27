import { Shield, Code, Users } from 'lucide-react';

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-center text-vscode-text mb-12">Why CodeZenKai?</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
          <Shield className="h-12 w-12 text-vscode-blue mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-vscode-text mb-3">Anti-Cheat Monitoring</h3>
          <p className="text-vscode-comment">Advanced tab switching and focus detection to ensure fair play in your contests.</p>
        </div>
        
        <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
          <Code className="h-12 w-12 text-vscode-green mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-vscode-text mb-3">Codeforces Integration</h3>
          <p className="text-vscode-comment">Use high-quality Codeforces problems with their robust judging system.</p>
        </div>
        
        <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-6 text-center">
          <Users className="h-12 w-12 text-vscode-yellow mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-vscode-text mb-3">Private Contests</h3>
          <p className="text-vscode-comment">Create contests for your friends, classmates, or study groups with custom settings.</p>
        </div>
      </div>
    </section>
  );
}

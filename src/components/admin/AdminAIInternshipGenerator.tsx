import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Save, Globe, Eye, EyeOff, FileText, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedInternship {
  title: string;
  description: string;
  duration: string;
  skills: string[];
  has_certificate: boolean;
  is_paid: boolean;
  price: number;
  original_text: string;
}

const AdminAIInternshipGenerator = () => {
  const { toast } = useToast();
  const [internshipUrl, setInternshipUrl] = useState('');
  const [internshipText, setInternshipText] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedInternship, setGeneratedInternship] = useState<GeneratedInternship | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const handleGenerate = async () => {
    const hasUrl = inputMode === 'url' && internshipUrl.trim();
    const hasText = inputMode === 'text' && internshipText.trim();

    if (!hasUrl && !hasText) {
      toast({
        title: 'Error',
        description: inputMode === 'url' ? 'Please enter an internship URL' : 'Please paste the internship description',
        variant: 'destructive',
      });
      return;
    }

    if (inputMode === 'url') {
      try {
        new URL(internshipUrl);
      } catch {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid URL (e.g., https://...)',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsGenerating(true);
    setGeneratedInternship(null);
    
    try {
      const body = inputMode === 'url' 
        ? { internshipUrl }
        : { internshipText };

      const { data, error } = await supabase.functions.invoke('generate-internship', {
        body,
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setGeneratedInternship(data.internship);
      toast({
        title: 'Internship Generated!',
        description: 'Review the details and publish when ready.',
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate internship',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!generatedInternship) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from('internships').insert({
        title: generatedInternship.title,
        description: generatedInternship.description,
        duration: generatedInternship.duration,
        skills: generatedInternship.skills,
        has_certificate: generatedInternship.has_certificate,
        is_paid: generatedInternship.is_paid,
        price: generatedInternship.price,
        is_active: publish,
      });

      if (error) throw error;

      toast({
        title: publish ? 'Internship Published!' : 'Internship Saved as Draft',
        description: publish ? 'The internship is now live.' : 'You can publish it later.',
      });

      setInternshipUrl('');
      setInternshipText('');
      setGeneratedInternship(null);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save internship',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof GeneratedInternship, value: any) => {
    if (generatedInternship) {
      setGeneratedInternship({ ...generatedInternship, [field]: value });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-secondary" />
        <h2 className="text-2xl font-bold">AI Internship Generator</h2>
        <Badge variant="secondary">Powered by AI</Badge>
      </div>

      {!generatedInternship && (
        <Card className="border-2 border-dashed border-secondary/20 bg-secondary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Internship with AI
            </CardTitle>
            <CardDescription>
              Paste text (recommended) or provide a URL to auto-generate an internship post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'url' | 'text')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  URL (Limited)
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-3 mt-4">
                <Textarea
                  placeholder="Copy & paste the internship description here..."
                  value={internshipText}
                  onChange={(e) => setInternshipText(e.target.value)}
                  rows={8}
                  className="text-sm"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !internshipText.trim()}
                  size="lg"
                  className="w-full h-12"
                  variant="secondary"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Internship
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Works with any internship description - just copy the text from any source.
                </p>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-3 mt-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="https://company.com/internships/... (LinkedIn not supported)"
                    value={internshipUrl}
                    onChange={(e) => setInternshipUrl(e.target.value)}
                    className="flex-1 h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !internshipUrl.trim()}
                    size="lg"
                    className="h-12 px-8"
                    variant="secondary"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ LinkedIn, Indeed & some sites block scraping. Use "Paste Text" instead.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {generatedInternship && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Internship</CardTitle>
              <CardDescription>Review and edit before publishing</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
              >
                {showOriginal ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showOriginal ? 'Hide' : 'View'} Original
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGeneratedInternship(null);
                  setInternshipUrl('');
                  setInternshipText('');
                }}
              >
                Start Over
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showOriginal ? (
              <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <Label className="text-sm font-medium">Original Content</Label>
                <pre className="mt-2 text-sm whitespace-pre-wrap">{generatedInternship.original_text}</pre>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={generatedInternship.title}
                    onChange={(e) => updateField('title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={generatedInternship.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      value={generatedInternship.duration}
                      onChange={(e) => updateField('duration', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Skills (comma-separated)</Label>
                    <Input
                      value={generatedInternship.skills.join(', ')}
                      onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={generatedInternship.has_certificate}
                      onCheckedChange={(checked) => updateField('has_certificate', checked)}
                    />
                    <Label>Certificate</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={generatedInternship.is_paid}
                      onCheckedChange={(checked) => updateField('is_paid', checked)}
                    />
                    <Label>Paid</Label>
                  </div>
                </div>

                {generatedInternship.is_paid && (
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={generatedInternship.price}
                      onChange={(e) => updateField('price', Number(e.target.value))}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="flex-1"
                    variant="secondary"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 mr-2" />
                    )}
                    Publish Internship
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Note:</strong> AI automatically structures internship content. 
            Review and edit details before publishing.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminAIInternshipGenerator;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Save, Globe, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedJob {
  job_title: string;
  company_name: string;
  location: string;
  job_type: string;
  experience_level: string;
  skills: string[];
  responsibilities: string;
  eligibility: string;
  seo_title: string;
  seo_description: string;
  original_text: string;
  ai_generated: boolean;
  status: string;
}

const AdminAIJobGenerator = () => {
  const { toast } = useToast();
  const [jobText, setJobText] = useState('');
  const [rewriteStyle, setRewriteStyle] = useState('fresher');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedJob, setGeneratedJob] = useState<GeneratedJob | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [applyUrl, setApplyUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const handleGenerate = async () => {
    if (!jobText.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste job content or URL',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job', {
        body: { jobText, rewriteStyle },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedJob(data.job);
      toast({
        title: 'Job Generated!',
        description: 'Review and edit the generated job before publishing.',
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate job',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!generatedJob || !applyUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide an apply URL',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('jobs').insert({
        job_title: generatedJob.job_title,
        company_name: generatedJob.company_name,
        location: generatedJob.location,
        job_type: generatedJob.job_type,
        experience_level: generatedJob.experience_level,
        skills: generatedJob.skills,
        responsibilities: generatedJob.responsibilities,
        eligibility: generatedJob.eligibility,
        seo_title: generatedJob.seo_title,
        seo_description: generatedJob.seo_description,
        original_text: generatedJob.original_text,
        ai_generated: true,
        source_url: sourceUrl || null,
        apply_url: applyUrl,
        status: publish ? 'published' : 'draft',
        is_active: publish,
      });

      if (error) throw error;

      toast({
        title: publish ? 'Job Published!' : 'Job Saved as Draft',
        description: publish ? 'The job is now live on the site.' : 'You can publish it later.',
      });

      // Reset form
      setJobText('');
      setGeneratedJob(null);
      setApplyUrl('');
      setSourceUrl('');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save job',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateJobField = (field: keyof GeneratedJob, value: any) => {
    if (generatedJob) {
      setGeneratedJob({ ...generatedJob, [field]: value });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">AI Job Generator</h2>
        <Badge variant="secondary">Powered by AI</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Input Job Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Source URL (Optional)</Label>
              <Input
                placeholder="https://linkedin.com/jobs/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Paste Job Description</Label>
              <Textarea
                placeholder="Paste the full job description here..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={12}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Rewrite Style</Label>
              <RadioGroup value={rewriteStyle} onValueChange={setRewriteStyle}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fresher" id="fresher" />
                  <Label htmlFor="fresher" className="cursor-pointer">Fresher (0 exp)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-2 years" id="experienced" />
                  <Label htmlFor="experienced" className="cursor-pointer">0-2 Years Experience</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !jobText.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Job with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Output Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Job {generatedJob && '(Editable)'}</CardTitle>
            {generatedJob && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
              >
                {showOriginal ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showOriginal ? 'Hide' : 'Show'} Original
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!generatedJob ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                <p>Generated job will appear here</p>
                <p className="text-sm">Paste content and click Generate</p>
              </div>
            ) : showOriginal ? (
              <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <Label className="text-sm font-medium">Original Content</Label>
                <pre className="mt-2 text-sm whitespace-pre-wrap">{generatedJob.original_text}</pre>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={generatedJob.job_title}
                      onChange={(e) => updateJobField('job_title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={generatedJob.company_name}
                      onChange={(e) => updateJobField('company_name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={generatedJob.location}
                      onChange={(e) => updateJobField('location', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Input
                      value={generatedJob.job_type}
                      onChange={(e) => updateJobField('job_type', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input
                      value={generatedJob.experience_level}
                      onChange={(e) => updateJobField('experience_level', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={generatedJob.skills.join(', ')}
                    onChange={(e) => updateJobField('skills', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Responsibilities</Label>
                  <Textarea
                    value={generatedJob.responsibilities}
                    onChange={(e) => updateJobField('responsibilities', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Eligibility</Label>
                  <Textarea
                    value={generatedJob.eligibility}
                    onChange={(e) => updateJobField('eligibility', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input
                    value={generatedJob.seo_title}
                    onChange={(e) => updateJobField('seo_title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Textarea
                    value={generatedJob.seo_description}
                    onChange={(e) => updateJobField('seo_description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Apply URL *</Label>
                  <Input
                    placeholder="https://company.com/careers/apply"
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
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
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 mr-2" />
                    )}
                    Publish Job
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Note:</strong> All AI-generated jobs are reviewed before publishing. 
            CodeBit360 is not the hiring company. Jobs are curated for educational purposes.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminAIJobGenerator;

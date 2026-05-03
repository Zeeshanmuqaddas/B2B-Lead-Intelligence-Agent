import { useState } from "react";
import { Copy, MailCheck, AlertTriangle, Send, Sparkles, CheckCircle2, Factory } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { analyzeEmail, generateReplyCode, LeadAnalysis } from "./services/ai";

export default function App() {
  const [emailInput, setEmailInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<LeadAnalysis | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [replyText, setReplyText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!emailInput.trim()) {
      setError("Please paste an email to analyze.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    setAnalysis(null);
    setReplyText(null);
    try {
      const result = await analyzeEmail(emailInput);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze the email. Please try again or check API keys.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReply = async () => {
    if (!analysis || !emailInput) return;
    setIsGeneratingReply(true);
    try {
      const result = await generateReplyCode(emailInput, analysis);
      setReplyText(result);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate a reply.");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-900";
    if (score >= 70) return "text-orange-600 dark:text-orange-500 bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-900";
    if (score >= 40) return "text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-900";
    return "text-gray-600 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 shadow-sm z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
              <Factory className="w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight text-slate-800">
              GarmentsB2B <span className="font-light text-slate-500">| Lead Intelligence</span>
            </h1>
          </div>
          <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" /> AI Agent Active
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
          <Card className="shadow-md border-slate-200/60 overflow-hidden group transition-all duration-300">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                <MailCheck className="w-5 h-5 text-indigo-600" />
                Incoming Email
              </CardTitle>
              <CardDescription>
                Paste the email content from a potential buyer below for AI analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid w-full gap-2">
                <Label htmlFor="email-body" className="sr-only">
                  Email Content
                </Label>
                <Textarea
                  id="email-body"
                  placeholder="Paste email subject and body here..."
                  className="min-h-[320px] resize-none border-slate-200 focus-visible:ring-indigo-600 text-base shadow-inner bg-slate-50/50 text-slate-800 font-medium"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-start gap-2 border border-red-100"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 pt-4 flex gap-3">
              <Button 
                onClick={handleAnalyze} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
                disabled={isAnalyzing || !emailInput.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="mr-2"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Analyzing Lead...
                  </>
                ) : (
                  <>Extract Intelligence</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Output / Dashboard */}
        <div className="lg:col-span-7 flex flex-col min-h-[600px]">
          <AnimatePresence mode="wait">
            {!analysis && !isAnalyzing ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50"
              >
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-100 text-indigo-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2 tracking-tight">Ready for Analysis</h3>
                <p className="text-slate-500 max-w-sm mb-6 text-sm">
                  Our AI Email Intelligence Agent will classify the lead, extract key company intelligence, assign a priority score, and check for spam.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-100 text-slate-600 font-normal">Extracts intent</Badge>
                  <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-100 text-slate-600 font-normal">Scores &gt; 70</Badge>
                  <Badge variant="secondary" className="bg-slate-100 hover:bg-slate-100 text-slate-600 font-normal">Blocks spam</Badge>
                </div>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 border rounded-xl bg-white shadow-sm"
              >
                <div className="relative w-16 h-16 mb-4">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-indigo-600"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-1">Applying B2B Garment Rules...</h3>
                <p className="text-slate-500 text-sm animate-pulse">Running semantic analysis & scoring model</p>
              </motion.div>
            ) : analysis ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 w-full"
              >
                <Tabs defaultValue="dashboard" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Intelligence Brief</h2>
                    <TabsList className="bg-slate-200/50 p-1">
                      <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
                      <TabsTrigger value="json" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Raw JSON</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="dashboard" className="mt-0 space-y-6 outline-none">
                    {/* Score Hero Section */}
                    {analysis.spam ? (
                      <Card className="bg-red-50 border-red-200 shadow-sm overflow-hidden text-red-900 relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                        <CardContent className="p-6 flex items-center gap-4">
                          <div className="bg-red-100 text-red-600 p-3 rounded-full shrink-0">
                            <AlertTriangle className="w-10 h-10" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold mb-1 tracking-tight">Spam / Irrelevant</h3>
                            <p className="text-red-700/80 font-medium">This email was classified as spam or non-business related.</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className={`col-span-1 sm:col-span-1 shadow-sm border ${getScoreColor(analysis.lead_score)} bg-opacity-30 flex flex-col justify-center items-center text-center p-6 transition-colors`}>
                          <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Lead Score</p>
                          <div className="text-5xl font-black tracking-tighter tabular-nums">{analysis.lead_score}</div>
                          <p className="text-xs font-semibold opacity-80 mt-2 uppercase tracking-wider">{analysis.lead_type.replace('_', ' ')}</p>
                        </Card>
                        <Card className="col-span-1 sm:col-span-2 shadow-sm border-slate-200 relative overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Buyer Intent Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-700 font-medium leading-relaxed">
                              "{analysis.intent_summary}"
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                                Intent: <span className="capitalize ml-1">{analysis.budget_signal}</span>
                              </Badge>
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200">
                                Inquiry: <span className="capitalize ml-1">{analysis.inquiry_type.replace('_', ' ')}</span>
                              </Badge>
                              {analysis.requires_auto_reply && (
                                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                  Auto-Reply Eligible (<span className="capitalize">{analysis.auto_reply_priority}</span>)
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Extraction Grid */}
                    {!analysis.spam && (
                      <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            Extracted Entity Data
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-sm">
                            <div className="p-4 space-y-4">
                              <div>
                                <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Company</p>
                                <p className="font-semibold text-slate-900">{analysis.company_name || <span className="text-slate-400 font-normal italic">Not specified</span>}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Contact Person</p>
                                <p className="font-semibold text-slate-900">{analysis.contact_person || <span className="text-slate-400 font-normal italic">Not specified</span>}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Country / Region</p>
                                <p className="font-semibold text-slate-900">{analysis.country || <span className="text-slate-400 font-normal italic">Not specified</span>}</p>
                              </div>
                            </div>
                            <div className="p-4 space-y-4 bg-slate-50/30">
                              <div>
                                <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Product Interest</p>
                                <p className="font-semibold text-slate-900">{analysis.product_interest || <span className="text-slate-400 font-normal italic">Not specified</span>}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Estimated Volume</p>
                                <p className="font-semibold text-slate-900">{analysis.order_volume_estimate || <span className="text-slate-400 font-normal italic">Not specified</span>}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Is Valid Lead?</p>
                                <p className="font-semibold text-slate-900 flex items-center gap-1">
                                  {analysis.is_lead ? (
                                    <><div className="w-2 h-2 rounded-full bg-green-500"></div> Yes</>
                                  ) : (
                                    <><div className="w-2 h-2 rounded-full bg-red-500"></div> No</>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Auto Reply Generation feature if eligible */}
                    {analysis.requires_auto_reply && !analysis.spam && (
                      <Card className="shadow-sm border-indigo-100 bg-indigo-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-indigo-900 flex items-center gap-2">
                            <Send className="w-5 h-5 text-indigo-600" />
                            Sales Reply Generator
                          </CardTitle>
                          <CardDescription className="text-indigo-700/70">
                            This is a high-quality lead. Automatically draft a persuasive, corporate response.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {!replyText ? (
                            <Button 
                              onClick={handleGenerateReply} 
                              disabled={isGeneratingReply}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            >
                              {isGeneratingReply ? (
                                <><motion.div animate={{rotate: 360}} transition={{repeat: Infinity, duration: 1, ease: "linear"}} className="mr-2"><Sparkles className="w-4 h-4"/></motion.div> Drafting Reply...</>
                              ) : (
                                <>Draft Professional Reply</>
                              )}
                            </Button>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-white border border-indigo-100 rounded-lg p-5 shadow-sm">
                                <p className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed font-medium">
                                  {replyText}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                onClick={() => navigator.clipboard.writeText(replyText)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy to Clipboard
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="json" className="mt-0 outline-none">
                    <Card className="shadow-sm border-slate-200 overflow-hidden">
                      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-slate-800 tracking-tight">Structured Output</CardTitle>
                          <CardDescription>Strict JSON according to the AI Agent Prompt</CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(analysis, null, 2))}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[500px] w-full bg-slate-950">
                          <pre className="p-6 text-sm text-green-400 font-mono">
                            {JSON.stringify(analysis, null, 2)}
                          </pre>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

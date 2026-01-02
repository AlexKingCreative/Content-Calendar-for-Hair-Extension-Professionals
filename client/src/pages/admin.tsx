import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Sparkles, Pencil, Trash2, Calendar, ArrowLeft, Award, 
  Users, CreditCard, BarChart3, DollarSign, Settings, ChevronLeft,
  List, LayoutGrid, Scissors, Send, Check, X, ExternalLink, LogOut,
  TrendingUp, Video, Play, MessageCircle, ArrowUpDown, ChevronUp, ChevronDown,
  Search, Shield, Flame, Building2, UserPlus
} from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Post, type Brand, type Method, type TrendAlert, categories, contentTypes, type Category, type ContentType } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type AdminSection = "posts" | "brands" | "methods" | "users" | "salons" | "billing" | "stats" | "submissions" | "trends" | "advice";

interface PostSubmission {
  id: number;
  userId: string;
  postId: number;
  instagramUrl: string;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

const navItems = [
  { id: "stats" as AdminSection, title: "Stats & MRR", icon: BarChart3 },
  { id: "trends" as AdminSection, title: "Trend Alerts", icon: TrendingUp },
  { id: "advice" as AdminSection, title: "Ashley's Advice", icon: MessageCircle },
  { id: "posts" as AdminSection, title: "Posts", icon: Calendar },
  { id: "submissions" as AdminSection, title: "Submissions", icon: Send },
  { id: "brands" as AdminSection, title: "Brands", icon: Award },
  { id: "methods" as AdminSection, title: "Methods", icon: Scissors },
  { id: "users" as AdminSection, title: "Users", icon: Users },
  { id: "salons" as AdminSection, title: "Salons", icon: Building2 },
  { id: "billing" as AdminSection, title: "Billing", icon: CreditCard },
];

export default function AdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState<AdminSection>("stats");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const [formData, setFormData] = useState({
    month: 1,
    day: 1,
    title: "",
    description: "",
    category: "Educational" as Category,
    contentType: "Photo" as ContentType,
    hashtags: "",
    instagramExampleUrl: "",
  });

  const [generateData, setGenerateData] = useState({
    month: 1,
    day: 1,
    theme: "",
    tone: "professional" as "professional" | "casual" | "fun" | "educational",
  });

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/admin/posts"],
  });

  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  const { data: methods = [], isLoading: methodsLoading } = useQuery<Method[]>({
    queryKey: ["/api/methods"],
  });

  const { data: adminStats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    activeSubscribers: number;
    trialingUsers: number;
    freeUsers: number;
    mrr: number;
    recentSignups: Array<{ userId: string; createdAt: string; subscriptionStatus: string }>;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery<PostSubmission[]>({
    queryKey: ["/api/submissions"],
  });

  const { data: trends = [], isLoading: trendsLoading } = useQuery<TrendAlert[]>({
    queryKey: ["/api/admin/trends"],
  });

  interface AshleysAdvice {
    id: number;
    advice: string;
    isActive: boolean;
    createdAt: string;
  }

  const { data: adviceList = [], isLoading: adviceLoading } = useQuery<AshleysAdvice[]>({
    queryKey: ["/api/admin/ashleys-advice"],
  });

  const [isAdviceDialogOpen, setIsAdviceDialogOpen] = useState(false);
  const [editingAdvice, setEditingAdvice] = useState<AshleysAdvice | null>(null);
  const [adviceForm, setAdviceForm] = useState({ advice: "", isActive: true });

  const createAdviceMutation = useMutation({
    mutationFn: async (data: typeof adviceForm) => {
      return apiRequest("POST", "/api/admin/ashleys-advice", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/ashleys-advice"] });
      setIsAdviceDialogOpen(false);
      setAdviceForm({ advice: "", isActive: true });
      toast({ title: "Advice added!" });
    },
    onError: () => {
      toast({ title: "Failed to create advice", variant: "destructive" });
    },
  });

  const updateAdviceMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<typeof adviceForm>) => {
      return apiRequest("PATCH", `/api/admin/ashleys-advice/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/ashleys-advice"] });
      setIsAdviceDialogOpen(false);
      setEditingAdvice(null);
      setAdviceForm({ advice: "", isActive: true });
      toast({ title: "Advice updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update advice", variant: "destructive" });
    },
  });

  const deleteAdviceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/ashleys-advice/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/ashleys-advice"] });
      toast({ title: "Advice deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete advice", variant: "destructive" });
    },
  });

  const openEditAdvice = (advice: AshleysAdvice) => {
    setEditingAdvice(advice);
    setAdviceForm({ advice: advice.advice, isActive: advice.isActive });
    setIsAdviceDialogOpen(true);
  };

  const handleAdviceSubmit = () => {
    if (editingAdvice) {
      updateAdviceMutation.mutate({ id: editingAdvice.id, ...adviceForm });
    } else {
      createAdviceMutation.mutate(adviceForm);
    }
  };

  const [isTrendDialogOpen, setIsTrendDialogOpen] = useState(false);
  const [editingTrend, setEditingTrend] = useState<TrendAlert | null>(null);
  const [trendForm, setTrendForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    instagramUrl: "",
    isActive: true,
  });

  const [submissionFilter, setSubmissionFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const filteredSubmissions = submissions.filter(s => submissionFilter === "all" || s.status === submissionFilter);

  const approveSubmissionMutation = useMutation({
    mutationFn: async ({ id, status, reviewNote }: { id: number; status: string; reviewNote?: string }) => {
      return apiRequest("PATCH", `/api/submissions/${id}/status`, { status, reviewNote });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/submissions"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      toast({ title: "Submission updated" });
    },
    onError: () => {
      toast({ title: "Failed to update submission", variant: "destructive" });
    },
  });

  const createTrendMutation = useMutation({
    mutationFn: async (data: typeof trendForm) => {
      return apiRequest("POST", "/api/admin/trends", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/trends"] });
      qc.invalidateQueries({ queryKey: ["/api/trends"] });
      setIsTrendDialogOpen(false);
      setTrendForm({ title: "", description: "", videoUrl: "", instagramUrl: "", isActive: true });
      toast({ title: "Trend alert created!" });
    },
    onError: () => {
      toast({ title: "Failed to create trend", variant: "destructive" });
    },
  });

  const updateTrendMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<typeof trendForm>) => {
      return apiRequest("PATCH", `/api/admin/trends/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/trends"] });
      qc.invalidateQueries({ queryKey: ["/api/trends"] });
      setIsTrendDialogOpen(false);
      setEditingTrend(null);
      setTrendForm({ title: "", description: "", videoUrl: "", instagramUrl: "", isActive: true });
      toast({ title: "Trend updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update trend", variant: "destructive" });
    },
  });

  const deleteTrendMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/trends/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/trends"] });
      qc.invalidateQueries({ queryKey: ["/api/trends"] });
      toast({ title: "Trend deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete trend", variant: "destructive" });
    },
  });

  const openEditTrend = (trend: TrendAlert) => {
    setEditingTrend(trend);
    setTrendForm({
      title: trend.title,
      description: trend.description,
      videoUrl: trend.videoUrl || "",
      instagramUrl: trend.instagramUrl || "",
      isActive: trend.isActive !== false,
    });
    setIsTrendDialogOpen(true);
  };

  const handleTrendSubmit = () => {
    if (editingTrend) {
      updateTrendMutation.mutate({ id: editingTrend.id, ...trendForm });
    } else {
      createTrendMutation.mutate(trendForm);
    }
  };

  const [newBrandName, setNewBrandName] = useState("");
  const [newMethodName, setNewMethodName] = useState("");

  const filteredPosts = posts.filter((post) => post.month === selectedMonth);

  const createBrandMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/brands", { name, isActive: true });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/brands"] });
      qc.invalidateQueries({ queryKey: ["/api/options"] });
      setNewBrandName("");
      toast({ title: "Brand added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add brand", variant: "destructive" });
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/brands/${id}`, { isActive });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/brands"] });
      qc.invalidateQueries({ queryKey: ["/api/options"] });
    },
    onError: () => {
      toast({ title: "Failed to update brand", variant: "destructive" });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/brands/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/brands"] });
      qc.invalidateQueries({ queryKey: ["/api/options"] });
      toast({ title: "Brand deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete brand", variant: "destructive" });
    },
  });

  const createMethodMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/methods", { name, isActive: true });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/methods"] });
      qc.invalidateQueries({ queryKey: ["/api/options"] });
      setNewMethodName("");
      toast({ title: "Method added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add method", variant: "destructive" });
    },
  });

  const updateMethodMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/methods/${id}`, { isActive });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/methods"] });
      qc.invalidateQueries({ queryKey: ["/api/options"] });
    },
    onError: () => {
      toast({ title: "Failed to update method", variant: "destructive" });
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/methods/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/methods"] });
      qc.invalidateQueries({ queryKey: ["/api/options"] });
      toast({ title: "Method deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete method", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/posts", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      qc.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: "Post created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PATCH", `/api/admin/posts/${id}`, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      qc.invalidateQueries({ queryKey: ["/api/posts"] });
      setEditingPost(null);
      resetForm();
      toast({ title: "Post updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update post", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/posts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      qc.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete post", variant: "destructive" });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/posts/generate", data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      qc.invalidateQueries({ queryKey: ["/api/posts"] });
      setIsGenerateOpen(false);
      setGenerateData({ month: 1, day: 1, theme: "", tone: "professional" });
      toast({ title: "Post generated successfully with AI" });
    },
    onError: () => {
      toast({ title: "Failed to generate post", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      month: 1,
      day: 1,
      title: "",
      description: "",
      category: "Educational",
      contentType: "Photo",
      hashtags: "",
      instagramExampleUrl: "",
    });
  };

  const handleCreate = () => {
    const hashtags = formData.hashtags
      .split(",")
      .map((h) => h.trim())
      .filter((h) => h.length > 0)
      .map((h) => (h.startsWith("#") ? h : `#${h}`));
    
    const date = `2025-${String(formData.month).padStart(2, "0")}-${String(formData.day).padStart(2, "0")}`;
    
    createMutation.mutate({
      ...formData,
      date,
      hashtags,
      instagramExampleUrl: formData.instagramExampleUrl || null,
      isAiGenerated: false,
    });
  };

  const handleUpdate = () => {
    if (!editingPost) return;
    
    const hashtags = formData.hashtags
      .split(",")
      .map((h) => h.trim())
      .filter((h) => h.length > 0)
      .map((h) => (h.startsWith("#") ? h : `#${h}`));
    
    const date = `2025-${String(formData.month).padStart(2, "0")}-${String(formData.day).padStart(2, "0")}`;
    
    updateMutation.mutate({
      id: editingPost.id,
      data: {
        ...formData,
        date,
        hashtags,
        instagramExampleUrl: formData.instagramExampleUrl || null,
      },
    });
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      month: post.month,
      day: post.day,
      title: post.title,
      description: post.description,
      category: post.category as Category,
      contentType: post.contentType as ContentType,
      hashtags: post.hashtags.join(", "),
      instagramExampleUrl: post.instagramExampleUrl || "",
    });
  };

  const handleGenerate = () => {
    generateMutation.mutate(generateData);
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back-home">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h2 className="font-heading font-semibold text-foreground">Admin</h2>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        data-testid={`nav-${item.id}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="md:hidden flex items-center gap-2 p-4 border-b border-border sticky top-0 bg-background z-50">
            <SidebarTrigger data-testid="button-admin-menu" />
            <span className="font-heading font-semibold text-foreground">Admin Dashboard</span>
          </div>
          <div className="p-6">
            {activeSection === "stats" && (
              <StatsSection stats={adminStats} isLoading={statsLoading} />
            )}

            {activeSection === "trends" && (
              <TrendsSection
                trends={trends}
                isLoading={trendsLoading}
                onCreateOpen={() => {
                  setEditingTrend(null);
                  setTrendForm({ title: "", description: "", videoUrl: "", instagramUrl: "", isActive: true });
                  setIsTrendDialogOpen(true);
                }}
                onEdit={openEditTrend}
                onDelete={(id) => deleteTrendMutation.mutate(id)}
                onToggleActive={(id, isActive) => updateTrendMutation.mutate({ id, isActive })}
                isPending={deleteTrendMutation.isPending || updateTrendMutation.isPending}
              />
            )}

            {activeSection === "advice" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-advice-title">
                      Ashley's Advice
                    </h1>
                    <p className="text-muted-foreground">Manage tips shown to users on posts (@missashleyhair)</p>
                  </div>
                  <Button onClick={() => {
                    setEditingAdvice(null);
                    setAdviceForm({ advice: "", isActive: true });
                    setIsAdviceDialogOpen(true);
                  }} data-testid="button-add-advice">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Advice
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      All Advice ({adviceList.length})
                    </CardTitle>
                    <CardDescription>
                      Tips are randomly shown to users on each post
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {adviceLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 rounded-md" />
                        ))}
                      </div>
                    ) : adviceList.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No advice yet. Add some tips for users!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {adviceList.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 p-4 rounded-md border bg-background"
                            data-testid={`advice-row-${item.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{item.advice}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={item.isActive ? "default" : "secondary"}>
                                  {item.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Added {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditAdvice(item)}
                                data-testid={`button-edit-advice-${item.id}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteAdviceMutation.mutate(item.id)}
                                disabled={deleteAdviceMutation.isPending}
                                data-testid={`button-delete-advice-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Dialog open={isAdviceDialogOpen} onOpenChange={setIsAdviceDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingAdvice ? "Edit Advice" : "Add Advice"}</DialogTitle>
                      <DialogDescription>
                        Enter a helpful tip that will randomly appear on posts
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="e.g., Post during peak engagement hours (9-11 AM or 7-9 PM) for maximum reach!"
                        value={adviceForm.advice}
                        onChange={(e) => setAdviceForm({ ...adviceForm, advice: e.target.value })}
                        className="min-h-24"
                        data-testid="input-advice-text"
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={adviceForm.isActive}
                          onCheckedChange={(checked) => setAdviceForm({ ...adviceForm, isActive: checked })}
                          data-testid="switch-advice-active"
                        />
                        <span className="text-sm">Active</span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAdviceDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAdviceSubmit}
                        disabled={!adviceForm.advice.trim() || createAdviceMutation.isPending || updateAdviceMutation.isPending}
                        data-testid="button-save-advice"
                      >
                        {editingAdvice ? "Update" : "Add"} Advice
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            {activeSection === "users" && (
              <UsersSection stats={adminStats} isLoading={statsLoading} />
            )}
            
            {activeSection === "salons" && (
              <SalonsSection />
            )}
            
            {activeSection === "billing" && (
              <BillingSection stats={adminStats} isLoading={statsLoading} />
            )}
            
            {activeSection === "posts" && (
              <PostsSection
                posts={filteredPosts}
                isLoading={isLoading}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
                onCreateOpen={() => setIsCreateOpen(true)}
                onGenerateOpen={() => setIsGenerateOpen(true)}
              />
            )}
            
            {activeSection === "brands" && (
              <BrandsSection
                brands={brands}
                isLoading={brandsLoading}
                newBrandName={newBrandName}
                setNewBrandName={setNewBrandName}
                onCreate={(name) => createBrandMutation.mutate(name)}
                onUpdate={(id, isActive) => updateBrandMutation.mutate({ id, isActive })}
                onDelete={(id) => deleteBrandMutation.mutate(id)}
                isCreating={createBrandMutation.isPending}
              />
            )}
            
            {activeSection === "methods" && (
              <MethodsSection
                methods={methods}
                isLoading={methodsLoading}
                newMethodName={newMethodName}
                setNewMethodName={setNewMethodName}
                onCreate={(name) => createMethodMutation.mutate(name)}
                onUpdate={(id, isActive) => updateMethodMutation.mutate({ id, isActive })}
                onDelete={(id) => deleteMethodMutation.mutate(id)}
                isCreating={createMethodMutation.isPending}
              />
            )}
            
            {activeSection === "submissions" && (
              <SubmissionsSection
                submissions={filteredSubmissions}
                posts={posts}
                isLoading={submissionsLoading}
                filter={submissionFilter}
                setFilter={setSubmissionFilter}
                onApprove={(id) => approveSubmissionMutation.mutate({ id, status: "approved" })}
                onReject={(id, note) => approveSubmissionMutation.mutate({ id, status: "rejected", reviewNote: note })}
                isPending={approveSubmissionMutation.isPending}
              />
            )}
          </div>
        </main>
      </div>

      <Dialog open={isCreateOpen || !!editingPost} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingPost(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              {editingPost ? "Update the post details below" : "Fill in the details for a new calendar post"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Month</label>
                <Select
                  value={formData.month.toString()}
                  onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-form-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Day</label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
                  data-testid="input-form-day"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Post title"
                data-testid="input-form-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of what to post"
                rows={4}
                data-testid="input-form-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
                >
                  <SelectTrigger data-testid="select-form-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Content Type</label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData({ ...formData, contentType: value as ContentType })}
                >
                  <SelectTrigger data-testid="select-form-content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Hashtags (comma-separated)</label>
              <Input
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                placeholder="#HairExtensions, #BeforeAfter"
                data-testid="input-form-hashtags"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Instagram Example URL (optional)</label>
              <Input
                value={formData.instagramExampleUrl}
                onChange={(e) => setFormData({ ...formData, instagramExampleUrl: e.target.value })}
                placeholder="https://www.instagram.com/p/..."
                data-testid="input-form-instagram-url"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setEditingPost(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={editingPost ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-post"
            >
              {editingPost ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Post with AI
            </DialogTitle>
            <DialogDescription>
              Let AI create a social media post idea for you
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Month</label>
                <Select
                  value={generateData.month.toString()}
                  onValueChange={(value) => setGenerateData({ ...generateData, month: parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-generate-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Day</label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={generateData.day}
                  onChange={(e) => setGenerateData({ ...generateData, day: parseInt(e.target.value) || 1 })}
                  data-testid="input-generate-day"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Theme or Topic (optional)</label>
              <Input
                value={generateData.theme}
                onChange={(e) => setGenerateData({ ...generateData, theme: e.target.value })}
                placeholder="e.g., Summer hair care tips"
                data-testid="input-generate-theme"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tone</label>
              <Select
                value={generateData.tone}
                onValueChange={(value) => setGenerateData({ ...generateData, tone: value as any })}
              >
                <SelectTrigger data-testid="select-generate-tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="fun">Fun & Playful</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              data-testid="button-generate-post"
            >
              {generateMutation.isPending ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTrendDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsTrendDialogOpen(false);
          setEditingTrend(null);
          setTrendForm({ title: "", description: "", videoUrl: "", instagramUrl: "", isActive: true });
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTrend ? "Edit Trend Alert" : "Create Trend Alert"}</DialogTitle>
            <DialogDescription>
              {editingTrend ? "Update the trend alert details" : "Create a new trend alert to notify users about trending content"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={trendForm.title}
                onChange={(e) => setTrendForm({ ...trendForm, title: e.target.value })}
                placeholder="e.g., Slicked-Back Low Buns Are Trending!"
                data-testid="input-trend-title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={trendForm.description}
                onChange={(e) => setTrendForm({ ...trendForm, description: e.target.value })}
                placeholder="Describe the trend and how stylists can create content around it..."
                rows={4}
                data-testid="input-trend-description"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Video Link (YouTube, TikTok, etc.)</label>
              <div className="flex gap-2 items-center">
                <Video className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={trendForm.videoUrl}
                  onChange={(e) => setTrendForm({ ...trendForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  data-testid="input-trend-video"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">YouTube videos will show an embedded preview</p>
            </div>

            <div>
              <label className="text-sm font-medium">Instagram Example Link</label>
              <div className="flex gap-2 items-center">
                <SiInstagram className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={trendForm.instagramUrl}
                  onChange={(e) => setTrendForm({ ...trendForm, instagramUrl: e.target.value })}
                  placeholder="https://www.instagram.com/p/..."
                  data-testid="input-trend-instagram"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Publish Immediately</label>
                <p className="text-xs text-muted-foreground">Make this visible to users right away</p>
              </div>
              <Switch
                checked={trendForm.isActive}
                onCheckedChange={(checked) => setTrendForm({ ...trendForm, isActive: checked })}
                data-testid="switch-trend-active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsTrendDialogOpen(false);
              setEditingTrend(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleTrendSubmit}
              disabled={!trendForm.title || !trendForm.description || createTrendMutation.isPending || updateTrendMutation.isPending}
              data-testid="button-submit-trend"
            >
              {(createTrendMutation.isPending || updateTrendMutation.isPending) ? "Saving..." : editingTrend ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

function StatsSection({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-stats-title">
          Stats & Analytics
        </h1>
        <p className="text-muted-foreground">Comprehensive overview of your business metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-mrr">
                ${((stats?.mrr || 0) / 100).toFixed(2)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">MRR from active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {stats?.totalUsers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-active-subs">
                {stats?.activeSubscribers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-conversion">
                {stats?.conversionRate || 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Trial to paid conversion</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Signups Today</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : (
              <div className="text-xl font-bold">{stats?.signupsToday || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Signups This Week</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : (
              <div className="text-xl font-bold">{stats?.signupsThisWeek || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Signups This Month</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : (
              <div className="text-xl font-bold">{stats?.signupsThisMonth || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-6 w-12" /> : (
              <div className="text-xl font-bold">{stats?.totalPosts || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Breakdown</CardTitle>
          <CardDescription>Distribution of user subscription statuses</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Active Subscribers</span>
                </div>
                <span className="font-medium">{stats?.activeSubscribers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Trialing</span>
                </div>
                <span className="font-medium">{stats?.trialingUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span>Free Users</span>
                </div>
                <span className="font-medium">{stats?.freeUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Cancelled</span>
                </div>
                <span className="font-medium">{stats?.cancelledUsers || 0}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Engagement Stats
            </CardTitle>
            <CardDescription>User streaks and posting activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Users with streaks</span>
                  <span className="font-medium">{stats?.usersWithStreaks || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average streak</span>
                  <span className="font-medium">{stats?.averageStreak || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Longest active streak</span>
                  <span className="font-medium">{stats?.longestActiveStreak || 0} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total posts logged</span>
                  <span className="font-medium">{stats?.totalPostsLogged || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Posting Activity
            </CardTitle>
            <CardDescription>Posts logged by time period</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-medium">{stats?.postsLoggedToday || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">This week</span>
                  <span className="font-medium">{stats?.postsLoggedThisWeek || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">This month</span>
                  <span className="font-medium">{stats?.postsLoggedThisMonth || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Challenge Stats
            </CardTitle>
            <CardDescription>User challenge participation</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active challenges</span>
                  <span className="font-medium">{stats?.activeChallenges || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{stats?.completedChallenges || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Abandoned</span>
                  <span className="font-medium">{stats?.abandonedChallenges || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completion rate</span>
                  <span className="font-medium">{stats?.challengeCompletionRate || 0}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SiInstagram className="w-5 h-5" />
              Instagram Integration
            </CardTitle>
            <CardDescription>Connected accounts and sync stats</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Connected users</span>
                  <span className="font-medium">{stats?.connectedInstagramUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total syncs</span>
                  <span className="font-medium">{stats?.totalInstagramSyncs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total synced posts</span>
                  <span className="font-medium">{stats?.totalSyncedPosts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recently synced (7 days)</span>
                  <span className="font-medium">{stats?.recentlySyncedPosts || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Salon Stats
            </CardTitle>
            <CardDescription>Salon owner plans and team members</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active salons</span>
                  <span className="font-medium">{stats?.activeSalons || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total seats</span>
                  <span className="font-medium">{stats?.totalSalonSeats || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accepted members</span>
                  <span className="font-medium">{stats?.acceptedSalonMembers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending invites</span>
                  <span className="font-medium">{stats?.pendingSalonInvites || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats?.topStreakers?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Streakers
            </CardTitle>
            <CardDescription>Users with the highest active streaks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topStreakers.map((user: { userId: string; currentStreak: number; totalPosts: number }, i: number) => (
                <div key={user.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                    <span className="font-medium font-mono text-sm">{user.userId.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{user.currentStreak} day streak</Badge>
                    <span className="text-sm text-muted-foreground">{user.totalPosts} posts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Popular Categories
            </CardTitle>
            <CardDescription>Content categories by post count</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : stats?.popularCategories?.length > 0 ? (
              <div className="space-y-3">
                {stats.popularCategories.slice(0, 8).map((cat: { name: string; count: number }, i: number) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <Badge variant="secondary">{cat.count} posts</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No category data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Popular Content Types
            </CardTitle>
            <CardDescription>Content types by post count</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : stats?.popularContentTypes?.length > 0 ? (
              <div className="space-y-3">
                {stats.popularContentTypes.map((type: { name: string; count: number }, i: number) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <Badge variant="secondary">{type.count} posts</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No content type data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Popular Brands
            </CardTitle>
            <CardDescription>Most selected certified brands by users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : stats?.popularBrands?.length > 0 ? (
              <div className="space-y-3">
                {stats.popularBrands.map((brand: { name: string; count: number }, i: number) => (
                  <div key={brand.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                      <span className="font-medium">{brand.name}</span>
                    </div>
                    <Badge variant="secondary">{brand.count} users</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No brand data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Popular Methods
            </CardTitle>
            <CardDescription>Most selected extension methods by users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : stats?.popularMethods?.length > 0 ? (
              <div className="space-y-3">
                {stats.popularMethods.map((method: { name: string; count: number }, i: number) => (
                  <div key={method.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                      <span className="font-medium">{method.name}</span>
                    </div>
                    <Badge variant="secondary">{method.count} users</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No method data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersSection({ stats, isLoading: statsLoading }: { stats: any; isLoading: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    subscriptionTier: "free",
    subscriptionStatus: "free",
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["/api/admin/users", sortField, sortOrder],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?sort=${sortField}&order=${sortOrder}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof createUserForm) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create user");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsCreateUserOpen(false);
      setCreateUserForm({ email: "", firstName: "", lastName: "", subscriptionTier: "free", subscriptionStatus: "free" });
      toast({ title: "User created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to create user", variant: "destructive" });
    },
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortOrder === "asc" ? 
      <ChevronUp className="w-3 h-3 ml-1" /> : 
      <ChevronDown className="w-3 h-3 ml-1" />;
  };

  const filteredUsers = usersData?.users?.filter((user: any) => {
    const matchesSearch = !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.instagram?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.subscriptionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-users-title">
            Users
          </h1>
          <p className="text-muted-foreground">View and manage all user accounts</p>
        </div>
        <Button onClick={() => setIsCreateUserOpen(true)} data-testid="button-add-user">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account manually</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (required)</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                data-testid="input-create-user-email"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  placeholder="First name"
                  value={createUserForm.firstName}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, firstName: e.target.value })}
                  data-testid="input-create-user-firstname"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  placeholder="Last name"
                  value={createUserForm.lastName}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, lastName: e.target.value })}
                  data-testid="input-create-user-lastname"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subscription Tier</label>
                <Select 
                  value={createUserForm.subscriptionTier} 
                  onValueChange={(v) => setCreateUserForm({ ...createUserForm, subscriptionTier: v })}
                >
                  <SelectTrigger data-testid="select-create-user-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="salon_owner">Salon Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={createUserForm.subscriptionStatus} 
                  onValueChange={(v) => setCreateUserForm({ ...createUserForm, subscriptionStatus: v })}
                >
                  <SelectTrigger data-testid="select-create-user-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createUserMutation.mutate(createUserForm)}
              disabled={!createUserForm.email || createUserMutation.isPending}
              data-testid="button-submit-create-user"
            >
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paying</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.activeSubscribers || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Free</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-muted-foreground">{stats?.freeUsers || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Salon Owners</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.activeSalons || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>{filteredUsers.length} users found</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, instagram..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-user-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Paying</SelectItem>
                  <SelectItem value="trialing">Trial</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th 
                      className="text-left py-3 px-2 font-medium text-sm cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("email")}
                      data-testid="header-email"
                    >
                      <span className="flex items-center">Email<SortIcon field="email" /></span>
                    </th>
                    <th 
                      className="text-left py-3 px-2 font-medium text-sm cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("firstName")}
                    >
                      <span className="flex items-center">Name<SortIcon field="firstName" /></span>
                    </th>
                    <th 
                      className="text-left py-3 px-2 font-medium text-sm cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("subscriptionStatus")}
                    >
                      <span className="flex items-center">Status<SortIcon field="subscriptionStatus" /></span>
                    </th>
                    <th 
                      className="text-left py-3 px-2 font-medium text-sm cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("currentStreak")}
                    >
                      <span className="flex items-center">Streak<SortIcon field="currentStreak" /></span>
                    </th>
                    <th 
                      className="text-left py-3 px-2 font-medium text-sm cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("totalPosts")}
                    >
                      <span className="flex items-center">Posts<SortIcon field="totalPosts" /></span>
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-sm">Salon</th>
                    <th 
                      className="text-left py-3 px-2 font-medium text-sm cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("createdAt")}
                    >
                      <span className="flex items-center">Joined<SortIcon field="createdAt" /></span>
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-muted/30" data-testid={`row-user-${user.id}`}>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {user.isAdmin && <Shield className="w-4 h-4 text-primary" />}
                          <span className="text-sm">{user.email || "No email"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm">
                          {user.firstName || user.lastName 
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge 
                          variant={
                            user.subscriptionStatus === "active" ? "default" : 
                            user.subscriptionStatus === "trialing" ? "outline" : 
                            "secondary"
                          }
                        >
                          {user.subscriptionStatus || "free"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm font-medium">{user.currentStreak || 0}</span>
                        {user.currentStreak >= 7 && <Flame className="w-3 h-3 inline ml-1 text-orange-500" />}
                      </td>
                      <td className="py-3 px-2 text-sm">{user.totalPosts || 0}</td>
                      <td className="py-3 px-2">
                        {user.ownedSalon ? (
                          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                            Owner: {user.ownedSalon.name}
                            <span className="ml-1 text-xs">({user.ownedSalon.acceptedMembers}/{user.ownedSalon.seatLimit})</span>
                          </Badge>
                        ) : user.salonId ? (
                          <Badge variant="secondary">Member</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {user.stripeCustomerId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              data-testid={`button-stripe-${user.id}`}
                            >
                              <a 
                                href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <CreditCard className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending || user.isAdmin}
                            data-testid={`button-delete-user-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No users found matching your criteria</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SalonsSection() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editingSalon, setEditingSalon] = useState<any>(null);
  const [expandedSalon, setExpandedSalon] = useState<number | null>(null);
  const [isCreateSalonOpen, setIsCreateSalonOpen] = useState(false);
  const [createSalonForm, setCreateSalonForm] = useState({
    name: "",
    ownerEmail: "",
    seatLimit: 5,
  });
  const [addingMemberToSalon, setAddingMemberToSalon] = useState<number | null>(null);
  const [addMemberForm, setAddMemberForm] = useState({ email: "" });

  const { data: salonsData, isLoading } = useQuery({
    queryKey: ["/api/admin/salons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/salons");
      if (!res.ok) throw new Error("Failed to fetch salons");
      return res.json();
    },
  });

  const updateSalonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/admin/salons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update salon");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/salons"] });
      setEditingSalon(null);
      toast({ title: "Salon updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update salon", variant: "destructive" });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/salon-members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationStatus: status }),
      });
      if (!res.ok) throw new Error("Failed to update member");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/salons"] });
      toast({ title: "Member status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update member", variant: "destructive" });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/salon-members/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete member");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/salons"] });
      toast({ title: "Member removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove member", variant: "destructive" });
    },
  });

  const createSalonMutation = useMutation({
    mutationFn: async (data: typeof createSalonForm) => {
      const res = await fetch("/api/admin/salons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create salon");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/salons"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsCreateSalonOpen(false);
      setCreateSalonForm({ name: "", ownerEmail: "", seatLimit: 5 });
      toast({ title: "Salon created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to create salon", variant: "destructive" });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ salonId, email }: { salonId: number; email: string }) => {
      const res = await fetch(`/api/admin/salons/${salonId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add member");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/salons"] });
      setAddingMemberToSalon(null);
      setAddMemberForm({ email: "" });
      toast({ title: "Member added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Failed to add member", variant: "destructive" });
    },
  });

  const salons = salonsData?.salons || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-salons-title">
            Salons
          </h1>
          <p className="text-muted-foreground">Manage salon owner accounts and their team members</p>
        </div>
        <Button onClick={() => setIsCreateSalonOpen(true)} data-testid="button-add-salon">
          <Building2 className="w-4 h-4 mr-2" />
          Add Salon
        </Button>
      </div>

      <Dialog open={isCreateSalonOpen} onOpenChange={setIsCreateSalonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Salon</DialogTitle>
            <DialogDescription>Create a new salon with an owner. If the owner email does not exist, a new user will be created.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Salon Name (required)</label>
              <Input
                placeholder="Glamour Hair Studio"
                value={createSalonForm.name}
                onChange={(e) => setCreateSalonForm({ ...createSalonForm, name: e.target.value })}
                data-testid="input-create-salon-name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner Email (required)</label>
              <Input
                type="email"
                placeholder="owner@example.com"
                value={createSalonForm.ownerEmail}
                onChange={(e) => setCreateSalonForm({ ...createSalonForm, ownerEmail: e.target.value })}
                data-testid="input-create-salon-email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seat Limit</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={createSalonForm.seatLimit}
                onChange={(e) => setCreateSalonForm({ ...createSalonForm, seatLimit: parseInt(e.target.value) || 5 })}
                data-testid="input-create-salon-seats"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSalonOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createSalonMutation.mutate(createSalonForm)}
              disabled={!createSalonForm.name || !createSalonForm.ownerEmail || createSalonMutation.isPending}
              data-testid="button-submit-create-salon"
            >
              {createSalonMutation.isPending ? "Creating..." : "Create Salon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addingMemberToSalon !== null} onOpenChange={(open) => !open && setAddingMemberToSalon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a new stylist to this salon. They will be immediately added with accepted status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address (required)</label>
              <Input
                type="email"
                placeholder="stylist@example.com"
                value={addMemberForm.email}
                onChange={(e) => setAddMemberForm({ email: e.target.value })}
                data-testid="input-add-member-email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingMemberToSalon(null)}>Cancel</Button>
            <Button 
              onClick={() => addingMemberToSalon && addMemberMutation.mutate({ salonId: addingMemberToSalon, email: addMemberForm.email })}
              disabled={!addMemberForm.email || addMemberMutation.isPending}
              data-testid="button-submit-add-member"
            >
              {addMemberMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {salons.reduce((sum: number, s: any) => sum + (s.memberStats?.accepted || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {salons.reduce((sum: number, s: any) => sum + (s.memberStats?.pending || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : salons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No salons created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {salons.map((salon: any) => (
            <Card key={salon.id} data-testid={`card-salon-${salon.id}`}>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{salon.name}</CardTitle>
                      <CardDescription>
                        Owner: {salon.owner?.email || salon.ownerUserId}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={salon.billingStatus === "active" ? "default" : "secondary"}>
                      {salon.billingStatus || "active"}
                    </Badge>
                    <Badge variant="outline">
                      {salon.memberStats?.accepted || 0}/{salon.seatLimit} seats
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingSalon(salon)}
                      data-testid={`button-edit-salon-${salon.id}`}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedSalon(expandedSalon === salon.id ? null : salon.id)}
                    >
                      {expandedSalon === salon.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedSalon === salon.id && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Team Members ({salon.members?.length || 0})</h4>
                      <Button 
                        size="sm" 
                        onClick={() => setAddingMemberToSalon(salon.id)}
                        data-testid={`button-add-member-${salon.id}`}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Add Member
                      </Button>
                    </div>
                    
                    {salon.members?.length > 0 ? (
                      <div className="space-y-2">
                        {salon.members.map((member: any) => (
                          <div 
                            key={member.id} 
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-md border"
                            data-testid={`row-member-${member.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Users className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {member.stylistName || member.email}
                                </p>
                                {member.stylistName && (
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                              {member.stylistStreak > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {member.stylistStreak} day streak
                                </span>
                              )}
                              <Badge 
                                variant={
                                  member.invitationStatus === "accepted" ? "default" : 
                                  member.invitationStatus === "pending" ? "outline" : 
                                  "secondary"
                                }
                              >
                                {member.invitationStatus}
                              </Badge>
                              {member.invitationStatus === "pending" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateMemberMutation.mutate({ id: member.id, status: "accepted" })}
                                  disabled={updateMemberMutation.isPending}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>
                              )}
                              {member.invitationStatus !== "revoked" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateMemberMutation.mutate({ id: member.id, status: "revoked" })}
                                  disabled={updateMemberMutation.isPending}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Revoke
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm("Remove this member from the salon?")) {
                                    deleteMemberMutation.mutate(member.id);
                                  }
                                }}
                                disabled={deleteMemberMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm py-4 text-center">No team members yet</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingSalon} onOpenChange={(open) => !open && setEditingSalon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Salon</DialogTitle>
            <DialogDescription>Update salon details and seat limits</DialogDescription>
          </DialogHeader>
          {editingSalon && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Salon Name</label>
                <Input
                  value={editingSalon.name || ""}
                  onChange={(e) => setEditingSalon({ ...editingSalon, name: e.target.value })}
                  data-testid="input-salon-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seat Limit</label>
                <Input
                  type="number"
                  value={editingSalon.seatLimit || 5}
                  onChange={(e) => setEditingSalon({ ...editingSalon, seatLimit: parseInt(e.target.value) })}
                  data-testid="input-seat-limit"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Seat Tier</label>
                <Select 
                  value={editingSalon.seatTier || "5-seats"}
                  onValueChange={(v) => setEditingSalon({ ...editingSalon, seatTier: v })}
                >
                  <SelectTrigger data-testid="select-seat-tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-seats">5 Seats</SelectItem>
                    <SelectItem value="10-plus-seats">10+ Seats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Billing Status</label>
                <Select 
                  value={editingSalon.billingStatus || "active"}
                  onValueChange={(v) => setEditingSalon({ ...editingSalon, billingStatus: v })}
                >
                  <SelectTrigger data-testid="select-billing-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSalon(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => updateSalonMutation.mutate({ 
                id: editingSalon.id, 
                data: {
                  name: editingSalon.name,
                  seatLimit: editingSalon.seatLimit,
                  seatTier: editingSalon.seatTier,
                  billingStatus: editingSalon.billingStatus,
                }
              })}
              disabled={updateSalonMutation.isPending}
              data-testid="button-save-salon"
            >
              {updateSalonMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BillingSection({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-billing-title">
          Billing
        </h1>
        <p className="text-muted-foreground">Revenue and subscription management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-32" />
            ) : (
              <div className="text-4xl font-bold text-green-600" data-testid="text-billing-mrr">
                ${((stats?.mrr || 0) / 100).toFixed(2)}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              From {stats?.activeSubscribers || 0} active subscribers at $10/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Active Subscriptions</span>
              <Badge variant="default">{stats?.activeSubscribers || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Trial Subscriptions</span>
              <Badge variant="secondary">{stats?.trialingUsers || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Conversion Rate</span>
              <Badge variant="outline">
                {stats?.totalUsers > 0 
                  ? ((stats?.activeSubscribers / stats?.totalUsers) * 100).toFixed(1) 
                  : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stripe Dashboard</CardTitle>
          <CardDescription>Access full billing management in Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          <a 
            href="https://dashboard.stripe.com" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              Open Stripe Dashboard
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

function PostsSection({
  posts,
  isLoading,
  selectedMonth,
  setSelectedMonth,
  onEdit,
  onDelete,
  onCreateOpen,
  onGenerateOpen,
}: {
  posts: Post[];
  isLoading: boolean;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  onCreateOpen: () => void;
  onGenerateOpen: () => void;
}) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-posts-title">
            Posts
          </h1>
          <p className="text-muted-foreground">Manage calendar post content ({posts.length} posts)</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
              data-testid="button-view-grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-36" data-testid="select-admin-month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={onGenerateOpen} data-testid="button-generate-ai">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
          
          <Button onClick={onCreateOpen} data-testid="button-create-post">
            <Plus className="w-4 h-4 mr-2" />
            Add Post
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No posts for {months[selectedMonth - 1]}</p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-4 p-4 hover-elevate"
                  data-testid={`row-post-${post.id}`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 text-center shrink-0">
                      <div className="text-xs text-muted-foreground">{months[post.month - 1].slice(0, 3)}</div>
                      <div className="text-lg font-semibold">{post.day}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {post.contentType}
                        </Badge>
                        {post.isAiGenerated && (
                          <Badge variant="default" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(post)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(post.id)}
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} data-testid={`card-post-${post.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardDescription>
                      {months[post.month - 1]} {post.day}
                    </CardDescription>
                    <CardTitle className="font-heading text-base line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(post)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(post.id)}
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {post.contentType}
                  </Badge>
                  {post.isAiGenerated && (
                    <Badge variant="default" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function BrandsSection({
  brands,
  isLoading,
  newBrandName,
  setNewBrandName,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
}: {
  brands: Brand[];
  isLoading: boolean;
  newBrandName: string;
  setNewBrandName: (name: string) => void;
  onCreate: (name: string) => void;
  onUpdate: (id: number, isActive: boolean) => void;
  onDelete: (id: number) => void;
  isCreating: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-brands-title">
          Brands
        </h1>
        <p className="text-muted-foreground">Manage certified hair brands</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Certified Brands</CardTitle>
          <CardDescription>
            Manage the list of certified hair brands available to stylists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new brand..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newBrandName.trim()) {
                  onCreate(newBrandName.trim());
                }
              }}
              data-testid="input-new-brand"
            />
            <Button
              onClick={() => {
                if (newBrandName.trim()) {
                  onCreate(newBrandName.trim());
                }
              }}
              disabled={!newBrandName.trim() || isCreating}
              data-testid="button-add-brand"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : brands.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No brands yet. Add your first brand above.
            </p>
          ) : (
            <div className="space-y-2">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-md border bg-background"
                  data-testid={`brand-row-${brand.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span className={brand.isActive ? "" : "text-muted-foreground line-through"}>
                      {brand.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {brand.isActive ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        checked={brand.isActive ?? true}
                        onCheckedChange={(checked) => onUpdate(brand.id, checked)}
                        data-testid={`switch-brand-${brand.id}`}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(brand.id)}
                      data-testid={`button-delete-brand-${brand.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MethodsSection({
  methods,
  isLoading,
  newMethodName,
  setNewMethodName,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
}: {
  methods: Method[];
  isLoading: boolean;
  newMethodName: string;
  setNewMethodName: (name: string) => void;
  onCreate: (name: string) => void;
  onUpdate: (id: number, isActive: boolean) => void;
  onDelete: (id: number) => void;
  isCreating: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-methods-title">
          Methods
        </h1>
        <p className="text-muted-foreground">Manage extension application methods</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Extension Methods</CardTitle>
          <CardDescription>
            Manage the list of extension application methods available to stylists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new method..."
              value={newMethodName}
              onChange={(e) => setNewMethodName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newMethodName.trim()) {
                  onCreate(newMethodName.trim());
                }
              }}
              data-testid="input-new-method"
            />
            <Button
              onClick={() => {
                if (newMethodName.trim()) {
                  onCreate(newMethodName.trim());
                }
              }}
              disabled={!newMethodName.trim() || isCreating}
              data-testid="button-add-method"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : methods.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No methods yet. Add your first method above.
            </p>
          ) : (
            <div className="space-y-2">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-md border bg-background"
                  data-testid={`method-row-${method.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Scissors className="w-4 h-4 text-muted-foreground" />
                    <span className={method.isActive ? "" : "text-muted-foreground line-through"}>
                      {method.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {method.isActive ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        checked={method.isActive ?? true}
                        onCheckedChange={(checked) => onUpdate(method.id, checked)}
                        data-testid={`switch-method-${method.id}`}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(method.id)}
                      data-testid={`button-delete-method-${method.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrendsSection({
  trends,
  isLoading,
  onCreateOpen,
  onEdit,
  onDelete,
  onToggleActive,
  isPending,
}: {
  trends: TrendAlert[];
  isLoading: boolean;
  onCreateOpen: () => void;
  onEdit: (trend: TrendAlert) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  isPending: boolean;
}) {
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be") 
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes("tiktok.com")) {
      return url;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-trends-title">
            Trend Alerts
          </h1>
          <p className="text-muted-foreground">Create trend alerts to notify your users about hot trends</p>
        </div>
        <Button onClick={onCreateOpen} data-testid="button-create-trend">
          <Plus className="w-4 h-4 mr-2" />
          New Trend Alert
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : trends.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-heading text-lg font-medium mb-2">No Trend Alerts Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first trend alert to notify users about trending content ideas</p>
            <Button onClick={onCreateOpen}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {trends.map((trend) => {
            const embedUrl = getVideoEmbedUrl(trend.videoUrl || "");
            return (
              <Card key={trend.id} className={trend.isActive ? "" : "opacity-60"} data-testid={`card-trend-${trend.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="font-heading text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {trend.title}
                        {!trend.isActive && <Badge variant="secondary">Draft</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Published {new Date(trend.publishedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {trend.isActive ? "Active" : "Hidden"}
                        </span>
                        <Switch
                          checked={trend.isActive !== false}
                          onCheckedChange={(checked) => onToggleActive(trend.id, checked)}
                          disabled={isPending}
                          data-testid={`switch-trend-${trend.id}`}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(trend)} data-testid={`button-edit-trend-${trend.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(trend.id)} disabled={isPending} data-testid={`button-delete-trend-${trend.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{trend.description}</p>
                  
                  <div className="flex gap-2 flex-wrap">
                    {trend.videoUrl && (
                      <a href={trend.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="gap-1">
                          <Video className="w-3 h-3" />
                          Video
                          <ExternalLink className="w-3 h-3" />
                        </Badge>
                      </a>
                    )}
                    {trend.instagramUrl && (
                      <a href={trend.instagramUrl} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="gap-1">
                          <SiInstagram className="w-3 h-3" />
                          Instagram Example
                          <ExternalLink className="w-3 h-3" />
                        </Badge>
                      </a>
                    )}
                  </div>

                  {embedUrl && embedUrl.includes("youtube") && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted mt-3">
                      <iframe
                        src={embedUrl}
                        title={trend.title}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubmissionsSection({
  submissions,
  posts,
  isLoading,
  filter,
  setFilter,
  onApprove,
  onReject,
  isPending,
}: {
  submissions: PostSubmission[];
  posts: Post[];
  isLoading: boolean;
  filter: "all" | "pending" | "approved" | "rejected";
  setFilter: (filter: "all" | "pending" | "approved" | "rejected") => void;
  onApprove: (id: number) => void;
  onReject: (id: number, note?: string) => void;
  isPending: boolean;
}) {
  const getPostTitle = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    return post ? `${months[post.month - 1]} ${post.day}: ${post.title}` : `Post #${postId}`;
  };

  const pendingCount = submissions.filter(s => s.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-submissions-title">
          Submissions
          {pendingCount > 0 && (
            <Badge variant="default" className="text-xs">{pendingCount} pending</Badge>
          )}
        </h1>
        <p className="text-muted-foreground">Review user-submitted Instagram posts</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            data-testid={`button-filter-${f}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <SiInstagram className="w-5 h-5" />
            User Submissions
          </CardTitle>
          <CardDescription>
            Review and approve Instagram posts submitted by users for featuring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-md" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No submissions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-md border bg-background"
                  data-testid={`submission-row-${sub.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{getPostTitle(sub.postId)}</p>
                    <a
                      href={sub.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{sub.instagramUrl}</span>
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {sub.status === "pending" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject(sub.id)}
                          disabled={isPending}
                          data-testid={`button-reject-${sub.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApprove(sub.id)}
                          disabled={isPending}
                          data-testid={`button-approve-${sub.id}`}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </>
                    ) : (
                      <Badge
                        variant={sub.status === "approved" ? "default" : "secondary"}
                        className={sub.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}
                      >
                        {sub.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

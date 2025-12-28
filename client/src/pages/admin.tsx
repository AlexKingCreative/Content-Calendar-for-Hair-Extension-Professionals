import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Sparkles, Pencil, Trash2, Calendar, ArrowLeft, Award, 
  Users, CreditCard, BarChart3, DollarSign, Settings, ChevronLeft,
  List, LayoutGrid, Scissors, Send, Check, X, ExternalLink, LogOut
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
import { type Post, type Brand, type Method, categories, contentTypes, type Category, type ContentType } from "@shared/schema";
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

type AdminSection = "posts" | "brands" | "methods" | "users" | "billing" | "stats" | "submissions";

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
  { id: "posts" as AdminSection, title: "Posts", icon: Calendar },
  { id: "submissions" as AdminSection, title: "Submissions", icon: Send },
  { id: "brands" as AdminSection, title: "Brands", icon: Award },
  { id: "methods" as AdminSection, title: "Methods", icon: Scissors },
  { id: "users" as AdminSection, title: "Users", icon: Users },
  { id: "billing" as AdminSection, title: "Billing", icon: CreditCard },
  { id: "stats" as AdminSection, title: "Stats & MRR", icon: BarChart3 },
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
            
            {activeSection === "users" && (
              <UsersSection stats={adminStats} isLoading={statsLoading} />
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
    </SidebarProvider>
  );
}

function StatsSection({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-stats-title">
          Stats & MRR
        </h1>
        <p className="text-muted-foreground">Overview of your business metrics</p>
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
              <div className="text-2xl font-bold text-green-600" data-testid="text-active-subs">
                {stats?.activeSubscribers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Paying customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600" data-testid="text-trialing">
                {stats?.trialingUsers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">On free trial</p>
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
            </div>
          )}
        </CardContent>
      </Card>

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

function UsersSection({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground" data-testid="text-users-title">
          Users
        </h1>
        <p className="text-muted-foreground">Manage user accounts and subscriptions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paying</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.activeSubscribers || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Free</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">{stats?.freeUsers || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>Latest user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : stats?.recentSignups?.length > 0 ? (
            <div className="space-y-2">
              {stats.recentSignups.map((user: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-md border">
                  <div>
                    <p className="font-medium">User {user.userId}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={user.subscriptionStatus === "active" ? "default" : "secondary"}>
                    {user.subscriptionStatus || "free"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent signups</p>
          )}
        </CardContent>
      </Card>
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

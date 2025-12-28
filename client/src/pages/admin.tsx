import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Pencil, Trash2, Calendar, ArrowLeft, Award, Check, X } from "lucide-react";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Post, type Brand, categories, contentTypes, type Category, type ContentType } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AdminPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
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

  const [newBrandName, setNewBrandName] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back-home">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading text-xl sm:text-2xl font-semibold text-foreground" data-testid="text-admin-title">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage calendar posts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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
              
              <Button variant="outline" onClick={() => setIsGenerateOpen(true)} data-testid="button-generate-ai">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
              
              <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-post">
                <Plus className="w-4 h-4 mr-2" />
                Add Post
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="posts" data-testid="tab-posts">
              <Calendar className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="brands" data-testid="tab-brands">
              <Award className="w-4 h-4 mr-2" />
              Brands
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-md" />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No posts for {months[selectedMonth - 1]}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
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
                            onClick={() => handleEdit(post)}
                            data-testid={`button-edit-${post.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(post.id)}
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
          </TabsContent>

          <TabsContent value="brands">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Certified Brands</CardTitle>
                <CardDescription>
                  Manage the list of certified hair extension brands available to stylists
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
                        createBrandMutation.mutate(newBrandName.trim());
                      }
                    }}
                    data-testid="input-new-brand"
                  />
                  <Button
                    onClick={() => {
                      if (newBrandName.trim()) {
                        createBrandMutation.mutate(newBrandName.trim());
                      }
                    }}
                    disabled={!newBrandName.trim() || createBrandMutation.isPending}
                    data-testid="button-add-brand"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>

                {brandsLoading ? (
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
                              onCheckedChange={(checked) => 
                                updateBrandMutation.mutate({ id: brand.id, isActive: checked })
                              }
                              data-testid={`switch-brand-${brand.id}`}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBrandMutation.mutate(brand.id)}
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
          </TabsContent>
        </Tabs>
      </main>

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
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : (editingPost ? "Update" : "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Post with AI
            </DialogTitle>
            <DialogDescription>
              Let AI create a post idea based on the date and optional theme
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
              <label className="text-sm font-medium">Theme (optional)</label>
              <Input
                value={generateData.theme}
                onChange={(e) => setGenerateData({ ...generateData, theme: e.target.value })}
                placeholder="e.g., Holiday preparations, Summer care"
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
                  <SelectItem value="fun">Fun</SelectItem>
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
              data-testid="button-generate-submit"
            >
              {generateMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

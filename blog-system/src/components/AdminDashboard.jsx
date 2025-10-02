import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MessageCircle, 
  Instagram,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    pendingComments: 0,
    instagramPosts: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const [postsRes, commentsRes, instagramRes] = await Promise.all([
        axios.get('/posts?status=published&limit=5'),
        axios.get('/comments/admin/all?limit=5'),
        axios.get('/instagram/stats')
      ]);

      setStats({
        posts: postsRes.data.pagination?.total || 0,
        comments: commentsRes.data.pagination?.total || 0,
        pendingComments: commentsRes.data.comments?.filter(c => c.status === 'pending').length || 0,
        instagramPosts: instagramRes.data.total || 0
      });

      setRecentPosts(postsRes.data.posts || []);
      setRecentComments(commentsRes.data.comments?.slice(0, 5) || []);

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Tem certeza que deseja deletar este post?')) return;

    try {
      await axios.delete(`/posts/${postId}`);
      toast({
        title: "Sucesso",
        description: "Post deletado com sucesso"
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar post",
        variant: "destructive"
      });
    }
  };

  const handleSyncInstagram = async () => {
    try {
      setSyncing(true);
      const response = await axios.post('/instagram/sync');
      
      toast({
        title: "Sucesso",
        description: `${response.data.syncedCount} posts sincronizados do Instagram`
      });
      
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao sincronizar Instagram",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      'published': 'default',
      'draft': 'secondary',
      'pending': 'outline',
      'approved': 'default',
      'rejected': 'destructive'
    };

    const labels = {
      'published': 'Publicado',
      'draft': 'Rascunho',
      'pending': 'Pendente',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Gerencie seu blog e conteúdo</p>
        </div>
        
        <Link to="/admin/posts/new">
          <Button className="flex items-center space-x-2">
            <Plus size={20} />
            <span>Novo Post</span>
          </Button>
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Publicados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.posts}</div>
            <p className="text-xs text-muted-foreground">
              Total de posts no blog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comentários</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingComments} pendentes de moderação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Instagram</CardTitle>
            <Instagram className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.instagramPosts}</div>
            <p className="text-xs text-muted-foreground">
              Sincronizados do Instagram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncInstagram}
                disabled={syncing}
                className="w-full flex items-center space-x-2"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Sincronizando...' : 'Sync Instagram'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Posts Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Posts Recentes</CardTitle>
            <Link to="/admin/posts/new">
              <Button variant="outline" size="sm">
                <Plus size={16} className="mr-2" />
                Novo Post
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum post encontrado
                </p>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{post.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(post.status)}
                        <span className="text-sm text-gray-500">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/blog`, '_blank')}
                      >
                        <Eye size={16} />
                      </Button>
                      <Link to={`/admin/posts/edit/${post.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comentários Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Comentários Recentes</CardTitle>
            <Link to="/admin/comments">
              <Button variant="outline" size="sm">
                <MessageCircle size={16} className="mr-2" />
                Ver Todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhum comentário encontrado
                </p>
              ) : (
                recentComments.map((comment) => (
                  <div key={comment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        {getStatusBadge(comment.status)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {comment.content}
                    </p>
                    {comment.post_title && (
                      <p className="text-xs text-gray-500 mt-1">
                        Post: {comment.post_title}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Links Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/posts/new">
              <Button variant="outline" className="w-full flex items-center space-x-2">
                <Plus size={16} />
                <span>Novo Post</span>
              </Button>
            </Link>
            
            <Link to="/admin/comments">
              <Button variant="outline" className="w-full flex items-center space-x-2">
                <MessageCircle size={16} />
                <span>Comentários</span>
              </Button>
            </Link>
            
            <Button
              variant="outline"
              onClick={() => window.open('/blog', '_blank')}
              className="w-full flex items-center space-x-2"
            >
              <ExternalLink size={16} />
              <span>Ver Blog</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('/instagram', '_blank')}
              className="w-full flex items-center space-x-2"
            >
              <Instagram size={16} />
              <span>Ver Instagram</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

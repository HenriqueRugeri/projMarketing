import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { 
  Calendar, 
  User, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Clock
} from 'lucide-react';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost.id);
    }
  }, [selectedPost]);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts?status=published&page=${page}&limit=6`);
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`/comments/post/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.author_name || !commentForm.author_email || !commentForm.content) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingComment(true);
      await axios.post('/comments', {
        post_id: selectedPost.id,
        ...commentForm
      });

      toast({
        title: "Sucesso",
        description: "Comentário enviado! Aguardando moderação.",
      });

      setCommentForm({
        author_name: '',
        author_email: '',
        content: ''
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao enviar comentário",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setSelectedPost(null)}
          className="mb-6 flex items-center space-x-2"
        >
          <ChevronLeft size={20} />
          <span>Voltar aos posts</span>
        </Button>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {selectedPost.featured_image && (
            <img
              src={selectedPost.featured_image}
              alt={selectedPost.title}
              className="w-full h-64 object-cover"
            />
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedPost.title}
            </h1>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center space-x-1">
                <User size={16} />
                <span>{selectedPost.author_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>{formatDate(selectedPost.created_at)}</span>
              </div>
            </div>

            <div 
              className="prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
          </div>
        </article>

        {/* Seção de Comentários */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <MessageCircle size={24} />
            <span>Comentários ({comments.length})</span>
          </h2>

          {/* Formulário de Comentário */}
          <form onSubmit={handleCommentSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Deixe seu comentário</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                placeholder="Seu nome"
                value={commentForm.author_name}
                onChange={(e) => setCommentForm({
                  ...commentForm,
                  author_name: e.target.value
                })}
                required
              />
              <Input
                type="email"
                placeholder="Seu email"
                value={commentForm.author_email}
                onChange={(e) => setCommentForm({
                  ...commentForm,
                  author_email: e.target.value
                })}
                required
              />
            </div>

            <Textarea
              placeholder="Escreva seu comentário..."
              value={commentForm.content}
              onChange={(e) => setCommentForm({
                ...commentForm,
                content: e.target.value
              })}
              className="mb-4"
              rows={4}
              required
            />

            <Button 
              type="submit" 
              disabled={submittingComment}
              className="flex items-center space-x-2"
            >
              <Send size={16} />
              <span>{submittingComment ? 'Enviando...' : 'Enviar Comentário'}</span>
            </Button>
          </form>

          {/* Lista de Comentários */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {comment.author_name}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nosso Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Descubra as últimas novidades, dicas e insights em nossos artigos
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            Nenhum post publicado ainda.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => setSelectedPost(post)}
              >
                {post.featured_image && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt || truncateText(post.content.replace(/<[^>]*>/g, ''))}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User size={14} />
                      <span>{post.author_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </Button>

              <span className="text-sm text-gray-600">
                Página {currentPage} de {pagination.pages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="flex items-center space-x-2"
              >
                <span>Próxima</span>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogPage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Trash2, 
  MessageCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Mail
} from 'lucide-react';

const CommentsManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchComments(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const fetchComments = async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status !== 'all') {
        params.append('status', status);
      }

      const response = await axios.get(`/comments/admin/all?${params}`);
      setComments(response.data.comments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar comentários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId) => {
    try {
      setProcessingIds(prev => new Set(prev).add(commentId));
      await axios.put(`/comments/${commentId}/approve`);
      
      toast({
        title: "Sucesso",
        description: "Comentário aprovado com sucesso"
      });
      
      fetchComments(currentPage, statusFilter);
    } catch (error) {
      console.error('Erro ao aprovar comentário:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar comentário",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleReject = async (commentId) => {
    try {
      setProcessingIds(prev => new Set(prev).add(commentId));
      await axios.put(`/comments/${commentId}/reject`);
      
      toast({
        title: "Sucesso",
        description: "Comentário rejeitado com sucesso"
      });
      
      fetchComments(currentPage, statusFilter);
    } catch (error) {
      console.error('Erro ao rejeitar comentário:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar comentário",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;

    try {
      setProcessingIds(prev => new Set(prev).add(commentId));
      await axios.delete(`/comments/${commentId}`);
      
      toast({
        title: "Sucesso",
        description: "Comentário deletado com sucesso"
      });
      
      fetchComments(currentPage, statusFilter);
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar comentário",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pending': { variant: 'outline', label: 'Pendente', color: 'text-yellow-600' },
      'approved': { variant: 'default', label: 'Aprovado', color: 'text-green-600' },
      'rejected': { variant: 'destructive', label: 'Rejeitado', color: 'text-red-600' }
    };

    const config = variants[status] || variants['pending'];
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusCount = (status) => {
    return comments.filter(comment => comment.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <MessageCircle size={28} />
              <span>Gerenciar Comentários</span>
            </h1>
            <p className="text-gray-600">
              Modere e gerencie os comentários do blog
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{pagination.total || 0}</div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {comments.filter(c => c.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {comments.filter(c => c.status === 'approved').length}
            </div>
            <p className="text-sm text-gray-600">Aprovados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {comments.filter(c => c.status === 'rejected').length}
            </div>
            <p className="text-sm text-gray-600">Rejeitados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter size={20} />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Status:</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Comentários */}
      <Card>
        <CardHeader>
          <CardTitle>
            Comentários ({pagination.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">
                Nenhum comentário encontrado
              </p>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? 'Não há comentários para exibir.'
                  : `Não há comentários com status "${statusFilter}".`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4 space-y-3">
                  {/* Header do comentário */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-500" />
                        <span className="font-medium">{comment.author_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">{comment.author_email}</span>
                      </div>
                      {getStatusBadge(comment.status)}
                    </div>
                    
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                  </div>

                  {/* Conteúdo do comentário */}
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>

                  {/* Post relacionado */}
                  {comment.post_title && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Post:</span> {comment.post_title}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    {comment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(comment.id)}
                          disabled={processingIds.has(comment.id)}
                          className="flex items-center space-x-1"
                        >
                          <Check size={14} />
                          <span>Aprovar</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(comment.id)}
                          disabled={processingIds.has(comment.id)}
                          className="flex items-center space-x-1"
                        >
                          <X size={14} />
                          <span>Rejeitar</span>
                        </Button>
                      </>
                    )}
                    
                    {comment.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(comment.id)}
                        disabled={processingIds.has(comment.id)}
                        className="flex items-center space-x-1"
                      >
                        <X size={14} />
                        <span>Rejeitar</span>
                      </Button>
                    )}
                    
                    {comment.status === 'rejected' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(comment.id)}
                        disabled={processingIds.has(comment.id)}
                        className="flex items-center space-x-1"
                      >
                        <Check size={14} />
                        <span>Aprovar</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(comment.id)}
                      disabled={processingIds.has(comment.id)}
                      className="flex items-center space-x-1 ml-auto"
                    >
                      <Trash2 size={14} />
                      <span>Deletar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default CommentsManager;

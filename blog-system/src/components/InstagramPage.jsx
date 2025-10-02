import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { 
  Instagram, 
  ExternalLink, 
  Play, 
  Image as ImageIcon,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw
} from 'lucide-react';

const InstagramPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInstagramPosts(currentPage);
  }, [currentPage]);

  const fetchInstagramPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/instagram/posts?page=${page}&limit=12`);
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao buscar posts do Instagram:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts do Instagram",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMediaTypeIcon = (mediaType) => {
    switch (mediaType) {
      case 'VIDEO':
        return <Play size={20} className="text-white" />;
      case 'CAROUSEL_ALBUM':
        return <Grid3X3 size={20} className="text-white" />;
      default:
        return <ImageIcon size={20} className="text-white" />;
    }
  };

  const getMediaTypeBadge = (mediaType) => {
    const types = {
      'IMAGE': { label: 'Imagem', variant: 'default' },
      'VIDEO': { label: 'Vídeo', variant: 'secondary' },
      'CAROUSEL_ALBUM': { label: 'Carrossel', variant: 'outline' }
    };
    
    const type = types[mediaType] || types['IMAGE'];
    return (
      <Badge variant={type.variant} className="text-xs">
        {type.label}
      </Badge>
    );
  };

  const truncateCaption = (caption, maxLength = 100) => {
    if (!caption || caption.length <= maxLength) return caption;
    return caption.substr(0, maxLength) + '...';
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
          <span>Voltar à galeria</span>
        </Button>

        <Card className="overflow-hidden">
          <div className="aspect-square max-w-2xl mx-auto">
            {selectedPost.media_type === 'VIDEO' ? (
              <video
                src={selectedPost.media_url}
                controls
                className="w-full h-full object-cover"
                poster={selectedPost.media_url}
              />
            ) : (
              <img
                src={selectedPost.media_url}
                alt="Instagram post"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Instagram size={20} className="text-pink-500" />
                <span className="font-semibold">Instagram</span>
                {getMediaTypeBadge(selectedPost.media_type)}
              </div>
              
              {selectedPost.permalink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedPost.permalink, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink size={16} />
                  <span>Ver no Instagram</span>
                </Button>
              )}
            </div>

            {selectedPost.caption && (
              <div className="mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedPost.caption}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{formatDate(selectedPost.timestamp)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Instagram size={40} className="text-pink-500" />
          <h1 className="text-4xl font-bold text-gray-900">
            Instagram Feed
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Confira nossos posts mais recentes diretamente do Instagram
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Instagram size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-4">
            Nenhum post do Instagram encontrado.
          </p>
          <p className="text-gray-500">
            Os posts serão sincronizados automaticamente quando disponíveis.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 group overflow-hidden"
                onClick={() => setSelectedPost(post)}
              >
                <div className="relative aspect-square overflow-hidden">
                  {post.media_type === 'VIDEO' ? (
                    <video
                      src={post.media_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      muted
                    />
                  ) : (
                    <img
                      src={post.media_url}
                      alt="Instagram post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  
                  {/* Overlay com ícone do tipo de mídia */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
                    {getMediaTypeIcon(post.media_type)}
                  </div>

                  {/* Overlay com informações ao hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                      <ExternalLink size={24} className="mx-auto mb-2" />
                      <p className="text-sm">Ver detalhes</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    {getMediaTypeBadge(post.media_type)}
                    <span className="text-xs text-gray-500">
                      {formatDate(post.timestamp).split(' ')[0]}
                    </span>
                  </div>
                  
                  {post.caption && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {truncateCaption(post.caption)}
                    </p>
                  )}
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

          {/* Informação sobre sincronização */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
              <RefreshCw size={16} />
              <span>Posts sincronizados automaticamente do Instagram</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstagramPage;

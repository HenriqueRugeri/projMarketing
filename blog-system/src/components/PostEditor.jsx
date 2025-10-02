import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon,
  Video,
  Music,
  X,
  Eye
} from 'lucide-react';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    featured_image: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id, isEditing]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts/${id}`);
      const post = response.data;
      
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        status: post.status || 'draft',
        featured_image: post.featured_image || ''
      });

      if (post.media && post.media.length > 0) {
        setUploadedFiles(post.media.map(media => ({
          id: media.id,
          filename: media.filename,
          originalName: media.original_name,
          mimeType: media.mime_type,
          url: `/uploads/${media.filename}`
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar post",
        variant: "destructive"
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await axios.put(`/posts/${id}`, formData);
        toast({
          title: "Sucesso",
          description: "Post atualizado com sucesso"
        });
      } else {
        const response = await axios.post('/posts', formData);
        toast({
          title: "Sucesso",
          description: "Post criado com sucesso"
        });
        navigate(`/admin/posts/edit/${response.data.postId}`);
      }
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao salvar post",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamanho do arquivo (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. Máximo 50MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      if (id) formData.append('post_id', id);

      const response = await axios.post('/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedFile = response.data.file;
      setUploadedFiles(prev => [...prev, uploadedFile]);

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: error.response?.data?.error || "Erro ao fazer upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const insertMediaIntoContent = (file) => {
    let mediaTag = '';
    
    if (file.mimeType.startsWith('image/')) {
      mediaTag = `<img src="${file.url}" alt="${file.originalName}" style="max-width: 100%; height: auto;" />`;
    } else if (file.mimeType.startsWith('video/')) {
      mediaTag = `<video controls style="max-width: 100%; height: auto;"><source src="${file.url}" type="${file.mimeType}">Seu navegador não suporta vídeo.</video>`;
    } else if (file.mimeType.startsWith('audio/')) {
      mediaTag = `<audio controls><source src="${file.url}" type="${file.mimeType}">Seu navegador não suporta áudio.</audio>`;
    }

    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + mediaTag
    }));
  };

  const setAsFeaturedImage = (file) => {
    if (file.mimeType.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        featured_image: file.url
      }));
      toast({
        title: "Sucesso",
        description: "Imagem definida como destaque"
      });
    }
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <ImageIcon size={16} />;
    if (mimeType.startsWith('video/')) return <Video size={16} />;
    if (mimeType.startsWith('audio/')) return <Music size={16} />;
    return <Upload size={16} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Post' : 'Novo Post'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Edite as informações do post' : 'Crie um novo post para o blog'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {formData.status === 'published' && (
            <Button
              variant="outline"
              onClick={() => window.open('/blog', '_blank')}
              className="flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Visualizar</span>
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Título *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="Digite o título do post"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Resumo
                  </label>
                  <Textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      excerpt: e.target.value
                    }))}
                    placeholder="Breve resumo do post (opcional)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Conteúdo *
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      content: e.target.value
                    }))}
                    placeholder="Escreva o conteúdo do post aqui. Você pode usar HTML básico."
                    rows={15}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Suporte a HTML básico. Use as mídias abaixo para inserir imagens, vídeos e áudios.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      status: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Imagem de Destaque
                  </label>
                  {formData.featured_image ? (
                    <div className="space-y-2">
                      <img
                        src={formData.featured_image}
                        alt="Imagem de destaque"
                        className="w-full h-32 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          featured_image: ''
                        }))}
                        className="w-full"
                      >
                        Remover Imagem
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 p-3 border rounded">
                      Nenhuma imagem de destaque definida. 
                      Faça upload de uma imagem abaixo e clique em "Definir como Destaque".
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{saving ? 'Salvando...' : 'Salvar Post'}</span>
                </Button>
              </CardContent>
            </Card>

            {/* Upload de Mídia */}
            <Card>
              <CardHeader>
                <CardTitle>Mídia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,video/*,audio/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload').click()}
                    disabled={uploading}
                    className="w-full flex items-center space-x-2"
                  >
                    <Upload size={16} />
                    <span>{uploading ? 'Enviando...' : 'Fazer Upload'}</span>
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Imagens, vídeos e áudios até 50MB
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Arquivos Enviados:</h4>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="p-2 border rounded text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file.mimeType)}
                            <span className="truncate">{file.originalName}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadedFile(file.id)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertMediaIntoContent(file)}
                            className="text-xs"
                          >
                            Inserir
                          </Button>
                          
                          {file.mimeType.startsWith('image/') && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAsFeaturedImage(file)}
                              className="text-xs"
                            >
                              Destaque
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;

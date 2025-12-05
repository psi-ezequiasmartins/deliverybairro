/**
 * DeliveryApp/src/app/menu/produtos/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import socket from '../../../services/socket';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { firebase_app } from "../../../config/apiFirebase";
import { imprimirListagemDeProdutos } from './impressao';

import Menu from '../../../components/menu';
import api from '../../../config/apiAxios';
import './index.css';


import pdfMake from "pdfmake/build/pdfmake";
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';



export default function Produtos() {
  const { t } = useTranslation();
  const storage = getStorage(firebase_app);
  const vDelivery = localStorage.getItem("vDelivery");
  const vID = localStorage.getItem("vID");

  const [busca, setBusca] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [produto_id, setProdutoID] = useState(null);
  const [produto_nome, setProdutoNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [vr_unitario, setVrUnitario] = useState(0.00);
  const [url_imagem, setUrlImagem] = useState('https://placehold.co/500');

  const [excluido, setExcluido] = useState(null);
  const [success, setSuccess] = useState('');
  const [itens_extras, setItensExtras] = useState('N');
  const [itens_obs, setItensObs] = useState('N');
  const [delivery_id, setDeliveryID] = useState(vID);

  const atualizarListagem = useCallback(async () => {
    try {
      const result = await api.get(`/delivery-app/listar/produtos/delivery/${vID}`);
      if (result.data.length > 0) {
        const searchLower = busca.toLowerCase();
        const listagem = result.data.filter((snapshot) =>
          snapshot.PRODUTO_ID.toString().includes(searchLower) ||
          snapshot.PRODUTO_NOME.toLowerCase().includes(searchLower) ||
          snapshot.DESCRICAO.toLowerCase().includes(searchLower) ||
          snapshot.VR_UNITARIO.toString().includes(searchLower)
        );
        setProdutos(listagem);
        setMsg('');
      } else {
        setProdutos([]);
        setMsg(t('app.products.no_products'));
      }
    } catch (error) {
      // ...existing code...
      setProdutos([]);
      setMsg(t('app.products.error_loading'));
    }
  }, [vID, busca, t]);

  useEffect(() => {
    atualizarListagem();

    // Escuta atualizações de status de pedidos via websocket
    socket.on('orderStatusUpdated', (data) => {
      // Atualize o estado dos pedidos conforme necessário
      setProdutos((prev) => prev.map(p => p.PRODUTO_ID === data.id ? { ...p, status: data.status } : p));
      console.log('Pedido atualizado via websocket:', data);
    });

    return () => {
      socket.off('orderStatusUpdated');
    };
  }, [atualizarListagem, busca, excluido]);

  function img_reset() {
    setUrlImagem('');
    setProdutoNome('');
    setDescricao('');
    setVrUnitario(0.00);
    setItensExtras('S');
    setItensObs('S');
    setProdutoID(null);
  }


  async function imgUpload(id) {
    const { value: file } = await Swal.fire({
      theme: 'dark',
      confirmButtonText: t('app.products.image_upload.send'),
      confirmButtonColor: '#3085d6',
      title: t('app.products.image_upload.select_title'),
      input: 'file',
      inputAttributes: {
        'accept': 'image/*',
        'aria-label': t('app.products.image_upload.select_title')
      }
    });

    if (file) {
      setLoadingImage(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        Swal.fire({
          theme: 'dark',
          title: t('app.products.image_upload.uploading_title') || 'Fazendo upload...',
          imageUrl: e.target.result,
          imageAlt: t('app.products.form.product_image'),
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      };
      reader.readAsDataURL(file);

      const metadata = {
        contentType: 'image/jpeg'
      };
      const storageRef = ref(storage, '/produtos/' + Date.now() + '_' + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload progress: ' + progress + '%');
      }, (error) => {
        setMsg('Erro no upload: ' + error.message);
        setLoadingImage(false);
        Swal.fire({
          theme: 'dark',
          icon: 'error',
          title: t('app.products.image_upload.upload_error') || 'Erro no upload',
          text: error.message,
          confirmButtonColor: '#d33'
        });
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
            setUrlImagem(downloadURL);
            await api.put(`/delivery-app/update/imagem/produto/${id}`, { "url_imagem": downloadURL });
            setMsg(t('app.products.image_upload.upload_success_backend'));
            setLoadingImage(false);

            Swal.fire({
              theme: 'dark',
              icon: 'success',
              title: t('app.products.image_upload.upload_success'),
              imageUrl: downloadURL,
              imageAlt: t('app.products.form.product_image'),
              confirmButtonColor: '#3085d6'
            }).then(() => {
              // Fecha o modal de edição usando Bootstrap API
              const modal = document.getElementById('md_editarproduto');
              if (modal) {
                const bsModal = Modal.getInstance(modal) || new Modal(modal);
                bsModal.hide();
              }
              atualizarListagem();
            });
          } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            setMsg('Erro ao salvar imagem no backend: ' + errorMsg);
            setLoadingImage(false);
            Swal.fire({
              theme: 'dark',
              icon: 'error',
              title: t('app.products.image_upload.save_error') || 'Erro ao salvar',
              text: errorMsg,
              confirmButtonColor: '#d33'
            });
          }
        }).catch((err) => {
          setMsg('Erro ao obter URL da imagem: ' + err.message);
          setLoadingImage(false);
          Swal.fire({
            theme: 'dark',
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível obter o link da imagem.',
            confirmButtonColor: '#d33'
          });
        });
      });
    }
  }

  async function uploadImageForNewProduct() {
    const { value: file } = await Swal.fire({
      theme: 'dark',
      confirmButtonText: t('app.products.image_upload.send'),
      confirmButtonColor: '#3085d6',
      title: t('app.products.image_upload.select_new_title'),
      input: 'file',
      inputAttributes: {
        'accept': 'image/*',
        'aria-label': t('app.products.image_upload.select_new_title')
      }
    });

    if (file) {
      setLoadingImage(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        Swal.fire({
          theme: 'dark',
          title: t('app.products.image_upload.preview_title') || 'Prévia da imagem',
          text: t('app.products.image_upload.preview_text') || 'A imagem será salva quando você finalizar o cadastro.',
          imageUrl: e.target.result,
          imageAlt: t('app.products.form.product_image'),
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6'
        });
      };
      reader.readAsDataURL(file);

      const metadata = {
        contentType: 'image/jpeg'
      };
      const storageRef = ref(storage, '/produtos/' + Date.now() + '_' + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload progress: ' + progress + '%');
      }, (error) => {
        setMsg(t('app.products.image_upload.upload_error') || 'Erro no upload: ' + error.message);
        setLoadingImage(false);
        Swal.fire({
          theme: 'dark',
          icon: 'error',
          title: t('app.products.image_upload.upload_error') || 'Erro no upload',
          text: error.message,
          confirmButtonColor: '#d33'
        });
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          setUrlImagem(downloadURL);
          setLoadingImage(false);
          Swal.fire({
            theme: 'dark',
            icon: 'success',
            title: t('app.products.image_upload.ready_title') || 'Imagem pronta!',
            text: t('app.products.image_upload.ready_text') || 'Agora clique em "Salvar" para finalizar o cadastro.',
            confirmButtonColor: '#3085d6'
          });
        }).catch((err) => {
          setMsg('Erro ao obter URL da imagem: ' + err.message);
          setLoadingImage(false);
          Swal.fire({
            theme: 'dark',
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível obter o link da imagem.',
            confirmButtonColor: '#d33'
          });
        });
      });
    }
  }

  async function Cadastrar() {
    if (produto_nome.length === 0) {
      setMsg(t('app.products.messages.name_required'));
      Swal.fire({
        theme: 'dark',
        icon: 'warning',
        title: t('app.products.messages.name_required'),
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      const vrUnitarioFormatted = vr_unitario.toString().replace(',', '.');
      const json = {
        "PRODUTO_NOME": produto_nome,
        "DESCRICAO": descricao,
        "VR_UNITARIO": vrUnitarioFormatted,
        "URL_IMAGEM": url_imagem,
        "ITENS_EXTRAS": itens_extras,
        "ITENS_OBS": itens_obs,
        "DELIVERY_ID": vID,
        "CHV": 1 // produto ativo por padrão
      };

      await api.post('/delivery-app/add/produto', json);

      setMsg(t('app.products.messages.created_success'));
      setSuccess('S');

      Swal.fire({
        theme: 'dark',
        icon: 'success',
        title: t('app.products.messages.created_success') || 'Produto cadastrado com sucesso!',
        confirmButtonColor: '#3085d6'
      }).then(() => {
        img_reset(); // Limpa o formulário
        setBusca(''); // Atualiza a listagem
        atualizarListagem();
      });

    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      setMsg(errorMsg);
      setSuccess("N");

      Swal.fire({
        theme: 'dark',
        icon: 'error',
        title: t('app.products.messages.error_title') || 'Erro ao cadastrar',
        text: errorMsg,
        confirmButtonColor: '#d33'
      });
    }
  }

  function Editar() {
    if (produto_nome.length === 0) {
      setMsg(t('app.products.messages.name_required'));
      Swal.fire({
        theme: 'dark',
        icon: 'warning',
        title: t('app.products.messages.name_required'),
        confirmButtonColor: '#3085d6'
      });
    } else if (!produto_id) {
      setMsg(t('app.products.messages.id_error'));
      Swal.fire({
        theme: 'dark',
        icon: 'error',
        title: t('app.products.messages.id_error'),
        confirmButtonColor: '#d33'
      });
    } else {
      const vrUnitarioFormatted = vr_unitario.toString().replace(',', '.');
      let info = {
        "PRODUTO_ID": produto_id,
        "PRODUTO_NOME": produto_nome,
        "DESCRICAO": descricao,
        "VR_UNITARIO": vrUnitarioFormatted,
        "URL_IMAGEM": url_imagem,
        "ITENS_EXTRAS": itens_extras,
        "ITENS_OBS": itens_obs,
        "DELIVERY_ID": delivery_id
      }
      api.put(`/delivery-app/update/produto/${produto_id}`, info).then(() => {
        setMsg('');
        setSuccess('S');
        Swal.fire({
          theme: 'dark',
          icon: 'success',
          title: t('app.products.messages.updated_success') || 'Produto atualizado com sucesso!',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          img_reset();
          setBusca('');
          atualizarListagem();
        });
      }).catch((error) => {
        const errorMsg = error.response?.data?.error || error.message;
        setMsg(errorMsg);
        setSuccess('N');
        Swal.fire({
          theme: 'dark',
          icon: 'error',
          title: t('app.products.messages.update_error') || 'Erro ao atualizar',
          text: errorMsg,
          confirmButtonColor: '#d33'
        });
      })
    }
  }

  function selectById(id) {
    api.get(`/delivery-app/produto/${id}`).then((result) => {
      if (result.data && result.data.PRODUTO_ID) {
        const produto = result.data;
        setProdutoID(produto.PRODUTO_ID);
        setProdutoNome(produto.PRODUTO_NOME);
        setDescricao(produto.DESCRICAO);
        setVrUnitario(produto.VR_UNITARIO);
        setUrlImagem(produto.URL_IMAGEM);
        setItensExtras(produto.ITENS_EXTRAS);
        setItensObs(produto.ITENS_OBS);
        setDeliveryID(produto.DELIVERY_ID);
      } else {
        setMsg(t('app.products.messages.not_found'));
      }
    }).catch((error) => {
      setMsg(t('app.products.messages.load_error') + error.message);
    })
  }

  function deleteByID(id) {
    api.delete(`/delivery-app/delete/produto/${id}`).then(() => {
      setExcluido(id);
      setBusca('');
      atualizarListagem();
      setMsg(t('app.products.messages.deleted_success'));
      setSuccess('S');
    })
  }

  function confirmaExclusao(id) {
    let produto = produtos.find(item => item.PRODUTO_ID === id);
    if (window.confirm(t('app.products.delete.confirm', { product: produto.PRODUTO_NOME }))) {
      deleteByID(id);
      alert(t('app.products.delete.deleted_text'));
    }
  }

  async function VisualizarPDF() {
    if (!produtos || produtos.length === 0) {
      setMsg(t('app.products.pdf_generation.no_products_text'));
      return;
    }
    try {
      const documento = imprimirListagemDeProdutos(produtos);
      pdfMake.createPdf(documento).open({}, window.open('', '_blank'));
    } catch (error) {
      setMsg(t('app.products.pdf_generation.error_text'));
    }
  }

  function Listagem(props) {
    return (
      <table className="table table-hover table-bordered">
        <thead>
          <tr className="table-secondary">
            <th scope="col">{t('app.products.table.id')}</th>
            <th scope="col">{t('app.products.table.image')}</th>
            <th scope="col">{t('app.products.table.product')}</th>
            <th scope="col">{t('app.products.table.unit_price')}</th>
            <th scope="col">{t('app.products.table.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {
            props.array.map((produto) => {
              return (
                <tr key={produto.PRODUTO_ID}>
                  <th scope="row">{produto.PRODUTO_ID}</th>
                  <td><img src={produto.URL_IMAGEM} alt="imagem" width="50" /></td>
                  <td>{produto.PRODUTO_NOME}</td>
                  <td>R$ {parseFloat(produto.VR_UNITARIO).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}</td>
                  <td>
                    <Link to="#" onClick={() => props.select(produto.PRODUTO_ID)} title={t('app.products.tooltips.edit')} data-bs-toggle="modal" data-bs-target="#md_editarproduto"><i className="fas fa-user-edit icon-action"></i></Link>
                    <Link to="#" onClick={() => props.image_upload(produto.PRODUTO_ID)} title={t('app.products.tooltips.upload_image')}><i className="fas fa-file-image icon-action"></i></Link>
                    <Link to="#" onClick={() => props.delete(produto.PRODUTO_ID)} title={t('app.products.tooltips.delete')}><i className="fas fa-trash-alt icon-action red"></i></Link>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0">
          <Menu page="produtos" />
        </div>
        <div className="col py-3 me-3">
          <h1>{t('app.products.page_title')} - {vID} {vDelivery}</h1>
          {loadingImage && (
            <div className="d-flex align-items-center mb-3">
              <div className="spinner-border text-primary me-2" role="status">
                <span className="visually-hidden">Carregando imagem...</span>
              </div>
              <span>Carregando imagem...</span>
            </div>
          )}
          <div className="row">
            <div className="col-6">
              <div className="mt-2 d-flex gap-1">
                <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#md_novoproduto" style={{ width: 'auto' }}><i className="fas fa-address-book"></i> {t('app.products.new_product')}</button>
                <button onClick={VisualizarPDF} className="btn btn-warning" style={{ width: 'auto' }}><i className="fas fa-file-pdf"></i> {t('app.products.pdf')}</button>
              </div>
            </div>
            <div className="col-6">
              <div className="input-group mt-2">
                <input onChange={e => setBusca(e.target.value)} type="text" className="form-control" placeholder={t('app.products.search_placeholder')} aria-describedby="bt_pesquisar" />
              </div>
            </div>
          </div>
          <Listagem array={produtos} select={selectById} delete={confirmaExclusao} image_upload={imgUpload} />
          {/* Modal Novo Produto */}
          <div className="modal fade" id="md_novoproduto" tabIndex="-1" aria-labelledby="titulo_modal" aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="titulo_modal">{t('app.products.form.new_title')}</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label htmlFor="produto_nome" className="form-label">{t('app.products.form.product_name')}</label>
                          <input onChange={e => setProdutoNome(e.target.value)} type="text" className="form-control" id="produto_nome" />
                        </div>
                        <div className="mb-2">
                          <label htmlFor="descricao" className="form-label">{t('app.products.form.description')}</label>
                          <textarea onChange={e => setDescricao(e.target.value)} type="text" className="form-control" style={{ height: 90 }} rows="3" id="descricao" ></textarea>
                        </div>
                        <div className="mb-2">
                          <label htmlFor="vr_unitario" className="form-label">{t('app.products.form.unit_price')}</label>
                          <input onChange={e => setVrUnitario(e.target.value)} type="text" className="form-control" id="vr_unitario" />
                        </div>
                        <div className="mb-2">
                          <p>{t('app.products.form.extras_question')}</p>
                          <div className="d-flex align-items-center">
                            <div className="form-check me-3">
                              <input onChange={e => setItensExtras("S")}
                                type="radio" className="form-check-input" id="itens_extras_sim" name="itens_extras" checked={itens_extras === "S"} required />
                              <label htmlFor="itens_extras_sim" className="form-check-label">{t('app.products.form.yes')}</label>
                            </div>
                            <div className="form-check">
                              <input onChange={e => setItensExtras("N")}
                                type="radio" className="form-check-input" id="itens_extras_nao" name="itens_extras" checked={itens_extras === "N"} required />
                              <label htmlFor="itens_extras_nao" className="form-check-label">{t('app.products.form.no')}</label>
                            </div>
                          </div>
                        </div>
                        <div className="mb-2">
                          <p>{t('app.products.form.obs_question')}</p>
                          <div className="d-flex align-items-center">
                            <div className="form-check me-3">
                              <input onChange={e => setItensObs("S")}
                                type="radio" className="form-check-input" id="itens_obs_sim" name="itens_obs" checked={itens_obs === "S"} required />
                              <label htmlFor="itens_obs_sim" className="form-check-label">{t('app.products.form.yes')}</label>
                            </div>
                            <div className="form-check">
                              <input onChange={e => setItensObs("N")}
                                type="radio" className="form-check-input" id="itens_obs_nao" name="itens_obs" checked={itens_obs === "N"} required />
                              <label htmlFor="itens_obs_nao" className="form-check-label">{t('app.products.form.no')}</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        {t('app.products.form.product_image')}<br />
                        <img className="ref" src={url_imagem || "https://placehold.co/500"} alt="Imagem do Produto" style={{ width: '100%', maxWidth: '320px', height: 'auto', maxHeight: '224px', objectFit: 'contain' }} />
                        <br /><br />
                        <button type="button" className="btn btn-success" onClick={uploadImageForNewProduct}>
                          <i className="fas fa-upload"></i> {t('app.products.form.add_image')}
                        </button>
                        {url_imagem && (
                          <button type="button" className="btn btn-warning ms-2" onClick={() => setUrlImagem('')}>
                            <i className="fas fa-trash"></i> {t('app.products.form.remove_image')}
                          </button>
                        )}
                      </div>
                    </div>
                    {msg.length > 0 ? <div className="alert alert-danger mt-2" role="alert">{msg}</div> : null}
                    {success === 'S' ? <Navigate to="/app/produtos" replace={true} /> : null}
                  </form>
                </div>
                <div className="modal-footer d-flex gap-1">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={img_reset} style={{ width: 'auto' }}>{t('common.cancel')}</button>
                  <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={Cadastrar} style={{ width: 'auto' }}>{t('common.save')}</button>
                </div>
              </div>
            </div>
          </div>
          {/* Modal Editar Produto */}
          <div className="modal fade" id="md_editarproduto" tabIndex="-1" aria-labelledby="titulo_modal" aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="titulo_modal">{t('app.products.form.edit_title')}</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label htmlFor="produto_nome" className="form-label">{t('app.products.form.product_name')}</label>
                          <input onChange={e => setProdutoNome(e.target.value)} value={produto_nome} type="text" className="form-control text-primary" id="produto_nome" />
                        </div>
                        <div className="mb-2">
                          <label htmlFor="descricao" className="form-label">{t('app.products.form.description')}</label>
                          <textarea onChange={e => setDescricao(e.target.value)} value={descricao} className="form-control text-primary" style={{ height: 90 }} rows="3" id="descricao" ></textarea>
                        </div>
                        <div className="mb-2">
                          <label htmlFor="vr_unitario" className="form-label">{t('app.products.form.unit_price')}</label>
                          <input onChange={e => setVrUnitario(e.target.value)} value={vr_unitario} type="text" className="form-control text-primary" id="vr_unitario" />
                        </div>
                        <div className="mb-2">
                          <p>{t('app.products.form.extras_question')}</p>
                          <div className="d-flex align-items-center">
                            <div className="form-check me-3">
                              <input onChange={e => setItensExtras("S")}
                                type="radio" className="form-check-input" id="itens_extras_sim" name="itens_extras" checked={itens_extras === "S"} required />
                              <label htmlFor="itens_extras_sim" className="form-check-label">{t('app.products.form.yes')}</label>
                            </div>
                            <div className="form-check">
                              <input onChange={e => setItensExtras("N")}
                                type="radio" className="form-check-input" id="itens_extras_nao" name="itens_extras" checked={itens_extras === "N"} required />
                              <label htmlFor="itens_extras_nao" className="form-check-label">{t('app.products.form.no')}</label>
                            </div>
                          </div>
                        </div>
                        <div className="mb-2">
                          <p>{t('app.products.form.obs_question')}</p>
                          <div className="d-flex align-items-center">
                            <div className="form-check me-3">
                              <input onChange={e => setItensObs("S")}
                                type="radio" className="form-check-input" id="itens_obs_sim" name="itens_obs" checked={itens_obs === "S"} required />
                              <label htmlFor="itens_obs_sim" className="form-check-label">{t('app.products.form.yes')}</label>
                            </div>
                            <div className="form-check">
                              <input onChange={e => setItensObs("N")}
                                type="radio" className="form-check-input" id="itens_obs_nao" name="itens_obs" checked={itens_obs === "N"} required />
                              <label htmlFor="itens_obs_nao" className="form-check-label">{t('app.products.form.no')}</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        {t('app.products.form.product_image')}<br />
                        <img className="ref" src={url_imagem || "https://placehold.co/450"} alt="Imagem do Produto" style={{ width: '100%', maxWidth: '320px', height: 'auto', maxHeight: '224px', objectFit: 'contain' }} />
                        <br /><br />
                        <button type="button" className="btn btn-success" onClick={() => imgUpload(produto_id)}>
                          <i className="fas fa-upload"></i> {t('app.products.form.change_image')}
                        </button>
                      </div>
                    </div>
                    {msg.length > 0 ? <div className="alert alert-danger mt-2" role="alert">{msg}</div> : null}
                    {success === 'S' ? <Navigate to="/app/produtos" replace={true} /> : null}
                  </form>
                </div>
                <div className="modal-footer d-flex gap-1">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={img_reset} style={{ width: 'auto' }}>{t('common.cancel')}</button>
                  <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={Editar} style={{ width: 'auto' }}>{t('common.save')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


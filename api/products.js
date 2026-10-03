const { getPool } = require('./_lib/db');
const { applyCors } = require('./_lib/cors');
const { ensurePaymentsSchema } = require('./_lib/ensurePaymentsSchema');
// Catálogo público: preços e disponibilidade vêm do MySQL.

const meta = {
  1:{category:'Casa & Decor'},2:{category:'Casa & Decor'},3:{category:'Vestuário'},4:{category:'Papelaria'},
  5:{category:'Eletrônicos'},6:{category:'Vestuário'},7:{category:'Eletrônicos'},8:{category:'Casa & Decor'},
  9:{category:'Eletrônicos'},10:{category:'Eletrônicos'},11:{category:'Eletrônicos'},12:{category:'Eletrônicos'},
  13:{category:'Eletrônicos'},14:{category:'Eletrônicos'},15:{category:'Eletrônicos'},16:{category:'Vestuário'},
  17:{category:'Vestuário'},18:{category:'Vestuário'},19:{category:'Vestuário'},20:{category:'Vestuário'},
  21:{category:'Vestuário'},22:{category:'Vestuário'},23:{category:'Casa & Decor'},24:{category:'Casa & Decor'},
  25:{category:'Casa & Decor'},26:{category:'Casa & Decor'},27:{category:'Casa & Decor'},28:{category:'Casa & Decor'},
  29:{category:'Pet Shop'},30:{category:'Pet Shop'},31:{category:'Pet Shop'},32:{category:'Pet Shop'},
  33:{category:'Papelaria'},34:{category:'Papelaria'},35:{category:'Papelaria'},36:{category:'Papelaria'},
  37:{category:'Beleza'},38:{category:'Beleza'},39:{category:'Beleza'},40:{category:'Beleza'},
  41:{category:'Esportes'},42:{category:'Esportes'},43:{category:'Esportes'},44:{category:'Esportes'},
  45:{category:'Esportes'},46:{category:'Eletrônicos'},47:{category:'Eletrônicos'},48:{category:'Casa & Decor'},
  49:{category:'Casa & Decor'},50:{category:'Papelaria'}
};

module.exports = async (req,res)=>{
  if(applyCors(req,res)) return;
  if(req.method!=='GET') return res.status(405).json({error:'Método não permitido.'});
  try{
    const db=getPool();
    await ensurePaymentsSchema(db);
    const [rows]=await db.execute('SELECT product_id AS id,name,price,active FROM fm_catalog WHERE active=1 ORDER BY product_id ASC');
    return res.status(200).json({
      success:true,
      products:rows.map(row=>({
        id:Number(row.id),
        name:row.name,
        price:Number(row.price),
        active:Boolean(row.active),
        category:meta[Number(row.id)]?.category || 'Ofertas'
      }))
    });
  }catch(error){
    console.error('products',error);
    if(error.code==='CONFIGURATION_ERROR') return res.status(503).json({error:'Configure o banco de dados da loja.'});
    return res.status(500).json({error:'Não foi possível carregar o catálogo.'});
  }
};

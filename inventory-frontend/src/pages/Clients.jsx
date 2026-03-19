import { useEffect, useState } from "react";
import axios from "axios";
import "./Clients.css";

function Clients() {

const [clients,setClients]=useState([]);
const [document,setDocument] = useState("");
const [name,setName] = useState("");
const [phone,setPhone] = useState("");


const loadClients = async () => {

const token = localStorage.getItem("token");

const res = await axios.get(
"http://localhost:8080/api/clients",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

setClients(res.data);
}

useEffect(()=>{
loadClients();
},[]);

const createClient = async () => {

const token = localStorage.getItem("token");

await axios.post(
"http://localhost:8080/api/clients",
{
document,
name,
phone,

},
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

loadClients();
}
const deleteClient = async(id)=>{

const token = localStorage.getItem("token");

await axios.delete(
`http://localhost:8080/api/clients/${id}`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

loadClients();
}
return(

<div className="clients-container">

<h2 className="title">Gestión de Clientes</h2>

<div className="client-form">

<input
placeholder="Cédula"
value={document}
onChange={(e)=>setDocument(e.target.value)}
/>

<input
placeholder="Nombre"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<input
placeholder="Teléfono"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
/>



<button onClick={createClient}>
Crear cliente
</button>

</div>

<table className="clients-table">

<thead>
<tr>
<th>Cédula</th>
<th>Nombre</th>
<th>Teléfono</th>

<th>Acciones</th>
</tr>
</thead>

<tbody>

{clients.map(c=>(

<tr key={c.id}>

<td>{c.document}</td>
<td>{c.name}</td>
<td>{c.phone}</td>


<td>

<button
className="delete-btn"
onClick={()=>deleteClient(c.id)}
>
Eliminar
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

)

}

export default Clients;
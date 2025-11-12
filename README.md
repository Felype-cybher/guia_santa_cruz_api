# 🚀 API do Projeto Guia Santa Cruz

API RESTful (Node.js + Express + PostgreSQL) que serve o aplicativo Guia Santa Cruz.

---

## 🛠️ Tecnologias Utilizadas

* **Node.js**
* **Express.js**
* **PostgreSQL** (Hospedado no Render)
* **pg** (Driver do Postgre)
* **bcrypt** (Para hash de senhas)
* **jsonwebtoken** (Para tokens JWT)
* **CORS**

---

## Endpoints da API (O Cardápio)

### 1. Autenticação (`/api/auth`)

* **`POST /register`**
    * **O que faz:** Cadastra um usuário novo.
    * **Corpo (JSON):** `{ "nome": "...", "email": "...", "senha": "..." }`

* **`POST /login`**
    * **O que faz:** Faz o login e retorna um token JWT.
    * **Corpo (JSON):** `{ "email": "...", "senha": "..." }`

### 2. Categorias (`/api/categorias`)

* **`POST /`**
    * **O que faz:** Cria uma nova categoria.
    * **Corpo (JSON):** `{ "nome": "Restaurantes" }`
    * **Auth:** (Aberta por enquanto)

* **`GET /`**
    * **O que faz:** Lista todas as categorias.
    * **Auth:** (Aberta)

### 3. Locais (`/api/locais`)

* **`POST /`**
    * **O que faz:** Cadastra um local novo.
    * **Corpo (JSON):** `{ "nome": "...", "endereco": "...", "latitude": ..., "longitude": ..., "status_validacao": "aprovado", "usuario_id": 1, "categorias_id": 1 }`
    * **Auth:** (Aberta por enquanto. **CUIDADO!** Precisamos proteger isso.)

* **`GET /`**
    * **O que faz:** Lista todos os locais que estão com `status_validacao = 'aprovado'`.
    * **Auth:** (Aberta)

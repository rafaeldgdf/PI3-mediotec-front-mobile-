
# Sistema de Gerenciamento Escolar (SGE)

## Autor
**Rafael Vitor de Oliveira**  
*Desenvolvedor de Software*

- [LinkedIn](https://www.linkedin.com/in/rafaelvitor2/)  
- [GitHub](https://github.com/rafaeldgdf)  
- **E-mail:** [rafaelvd2@hotmail.com](mailto:rafaelvd2@hotmail.com)

---

## Introdução
O **SGE - Sistema de Gerenciamento Escolar** é uma plataforma integrada para a administração de instituições de ensino técnico e médio. O projeto contempla um front-end desenvolvido em **React Native** para dispositivos móveis e um back-end baseado em **Spring Boot**, com suporte ao gerenciamento acadêmico e administrativo de forma escalável e segura.  

Com funcionalidades que atendem diferentes perfis de usuários (**coordenadores**, **professores** e **alunos**), o sistema permite a centralização de informações, comunicação eficiente e automação de processos.

---

## Objetivo do Projeto
- **Centralizar a gestão acadêmica e administrativa.**
- **Automatizar o acompanhamento de alunos, professores e disciplinas.**
- **Facilitar a comunicação por meio de comunicados e notificações.**
- **Gerar relatórios e estatísticas úteis para coordenação e gestão.**

O objetivo final é modernizar processos escolares e melhorar a experiência dos usuários.

---

## Tecnologias Utilizadas

### Front-end
- **React Native** para construção da interface móvel.
- **React Navigation** para gerenciamento de rotas.
- **Axios** para consumo de APIs REST.
- **Expo** para desenvolvimento ágil e testes em dispositivos físicos.
- **React Native Elements** e **Vector Icons** para componentes reutilizáveis.

### Back-end
- **Java (Spring Boot):** Implementação das regras de negócio e APIs.
- **MySQL:** Banco de dados relacional.
- **JPA/Hibernate:** Mapeamento objeto-relacional.
- **Swagger/OpenAPI:** Documentação interativa da API.
- **Heroku:** Hospedagem do back-end.

---

## Recursos Disponíveis

### Perfil Coordenador
- Gerenciamento de **turmas**, **disciplinas** e **usuários**.
- Envio de **comunicados** para alunos e professores.
- Consulta a relatórios de desempenho e presença.

### Perfil Professor
- Registro de **frequência**.
- Acompanhamento de **notas e conceitos**.
- Comunicação com alunos.

### Perfil Aluno
- Acesso a **boletins**, **presença** e **horários**.
- Recebimento de **comunicados**.

---

## Estrutura do Código

### Front-end
```
src/
├── api/ # Configuração da API (Axios)
├── components/ # Componentes reutilizáveis
├── navigation/ # Navegação
├── screens/ # Telas do aplicativo
│   ├── login/ # Tela de login
│   ├── GerenciamentoUsuarios/
│   ├── GerenciamentoAcademico/
├── styles/ # Estilos globais
```

### Back-end
```
src/main/java/
└── projeto.integrador3.senac.mediotec/
    ├── aluno/ # Gerenciamento de alunos
    ├── coordenacao/ # Gestão de coordenações
    ├── professor/ # Controle de professores
    ├── disciplina/ # Operações relacionadas às disciplinas
    └── comunicado/ # Envio e recebimento de comunicados
```

---

## Como Executar o Projeto

### Pré-requisitos
- **Node.js** (LTS)
- **npm** ou **yarn**
- **Expo CLI**
- **JDK 11 ou superior**
- **MySQL**

### Passos para o Front-end
1. Clone o repositório:
   ```bash
   git clone https://github.com/rafaeldgdf/PI3-mediotec-front-mobile-.git
   cd PI3-mediotec/front-end
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o Expo:
   ```bash
   npx expo start
   ```
4. Configure o arquivo `src/api/api.js` com a URL do back-end:
   ```javascript
   const api = axios.create({
     baseURL: 'http://SEU_BACKEND_URL:8080',
   });
   ```

### Passos para o Back-end



1. Clone o repositório:
   ```bash
   git clone https://github.com/rafaeldgdf/PI3-mediotec.git
  cd PI3-mediotec/back-end
   ```
2. Configure o MySQL no `application.properties`:
   ```bash
   spring.datasource.url=jdbc:mysql://localhost:3306/sge
   spring.datasource.username=SEU_USUARIO
   spring.datasource.password=SUA_SENHA
   ```
3. Execute o projeto:
   ```bash
   mvn spring-boot:run
   ```
4. Acesse a documentação da API: [Swagger UI](http://localhost:8080/swagger-ui/).

---

## Dados de Teste

### Coordenador
- E-mail: eddie.vedder@coordenacao.com
- Senha: eddie.vedder@coordenacao.com

### Professor
- E-mail: alex.turner@prof.com
- Senha: alex.turner@prof.com

### Aluno
- E-mail: luana.silva@coordenacao.com
- Senha: luana.silva@coordenacao.com

---

## Melhorias Futuras
- Notificações push.
- Suporte para múltiplos idiomas.
- Implementação de Redux para gerenciamento de estado global.
- Melhorias em acessibilidade.

---

## Contribuindo
Contribuições são bem-vindas! Caso tenha sugestões, envie um pull request ou abra uma issue.

Para suporte ou dúvidas, entre em contato pelo e-mail ou no GitHub Issues.

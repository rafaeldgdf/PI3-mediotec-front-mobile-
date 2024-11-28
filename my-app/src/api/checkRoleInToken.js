import jwt_decode from 'jwt-decode';

const checkRoleInToken = async () => {
  const token = await AsyncStorage.getItem('jwtToken');  // Recupera o token JWT
  
  if (token) {
    try {
      // Decodifica o JWT
      const decoded = jwt_decode(token);
      console.log('Token Decodificado:', decoded);  // Log do token decodificado

      // Verifique se a role está presente no payload
      const role = decoded.role;  // ou 'roles' caso tenha uma lista de roles

      console.log('Role extraída:', role);
      
      if (role === 'COORDENADOR') {
        console.log('Usuário com a role COORDENADOR');
      } else {
        console.log('Role não é COORDENADOR');
      }

    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
    }
  } else {
    console.log('Token não encontrado');
  }
};

checkRoleInToken();

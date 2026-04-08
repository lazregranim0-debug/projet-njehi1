// Récupérer les éléments du formulaire
const emailInput = document.querySelector('input[placeholder*="اسم المستخدم"]');
const passwordInput = document.querySelector('input[type="password"]');
const loginBtn = document.querySelector('button');

// Fonction de validation
function validerFormulaire() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  // Vérifier que les champs ne sont pas vides
  if (!email || !password) {
    alert('❌ Remplissez tous les champs !');
    return false;
  }
  
  // Vérifier le format email
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    alert('❌ Email invalide !');
    return false;
  }
  
  // Vérifier la longueur du mot de passe
  if (password.length < 6) {
    alert('❌ Le mot de passe doit avoir au moins 6 caractères !');
    return false;
  }
  
  return true;
}

// Fonction de connexion
async function connecter() {
  if (!validerFormulaire()) {
    return; // Arrêter si validation échoue
  }
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  try {
    // Envoyer les données au serveur
    const response = await fetch('login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('✅ Connexion réussie !');
      window.location.href = 'dashboard.html'; // Rediriger
    } else {
      alert('❌ Email ou mot de passe incorrect !');
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('❌ Erreur de connexion au serveur');
  }
}

// Ajouter un écouteur au bouton
loginBtn.addEventListener('click', connecter);

// Permettre la connexion avec Entrée
document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    connecter();
  }
});
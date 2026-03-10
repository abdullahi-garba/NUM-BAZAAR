<template>
  <div class="home">
    <h1>Welcome to NUM BAZAAR</h1>
    <p>The premier marketplace for the Newgate University Minna community.</p>
    
    <div class="actions">
      <RouterLink to="/auth" class="btn">Join the Bazaar</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home { text-align: center; margin-top: 80px; }
h1 { font-size: 3rem; color: var(--num-navy); }
p { font-size: 1.3rem; color: #555; margin-bottom: 40px; }
.btn {
  display: inline-block;
  padding: 12px 24px;
  background-color: var(--num-navy); /* Primary Navy Action */
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.1rem;
}
.btn { background-color: #001a3a; }
</style>


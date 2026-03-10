<template>
  <div class="workspace-container">
    <h2>Seller Workspace</h2>
    <p>Upload a new product to the NUM BAZAAR.</p>

    <div class="card">
      <h3>Add New Product</h3>
      <form @submit.prevent="addProduct" class="product-form">
        <input v-model="newProduct.title" type="text" placeholder="Product Title" required />
        
        <textarea v-model="newProduct.description" placeholder="Product Description" rows="4" required></textarea>
        
        <input v-model="newProduct.price" type="number" placeholder="Price (₦)" required />
        
        <input v-model="newProduct.image_url" type="text" placeholder="Image URL (optional)" />

        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Uploading...' : 'List Product' }}
        </button>
      </form>

      <p v-if="message" :class="{'success-msg': isSuccess, 'error-msg': !isSuccess}">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../lib/supabaseClient';

const newProduct = ref({
  title: '',
  description: '',
  price: '',
  image_url: ''
});

const isSubmitting = ref(false);
const message = ref('');
const isSuccess = ref(false);

const addProduct = async () => {
  isSubmitting.value = true;
  message.value = '';

  try {
    // 1. Get the current logged-in seller's data
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("You must be logged in to add a product.");

    // 2. Insert the product into the Supabase database
    const { error } = await supabase
      .from('products')
      .insert([
        {
          seller_id: user.id, // This links the product to this specific seller
          title: newProduct.value.title,
          description: newProduct.value.description,
          price: parseFloat(newProduct.value.price),
          image_url: newProduct.value.image_url
          // Note: is_approved defaults to false based on our SQL schema, 
          // so admins still need to approve it later!
        }
      ]);

    if (error) throw error;

    // 3. Success! Clear the form.
    isSuccess.value = true;
    message.value = 'Product added to the queue successfully!';
    newProduct.value = { title: '', description: '', price: '', image_url: '' };

  } catch (error) {
    isSuccess.value = false;
    message.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.workspace-container { max-width: 800px; margin: 40px auto; padding: 20px; }
h2 { color: var(--num-navy); }
.card { border: none; padding: 30px; border-radius: 8px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.product-form { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
button { padding: 12px; background-color: var(--num-navy); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.success-msg { color: #155724; background-color: #d4edda; border: 1px solid #c3e6cb; padding: 10px; border-radius: 4px; margin-top: 10px; text-align: center;}
.error-msg { color: var(--num-oxblood); margin-top: 10px; text-align: center; }
</style>
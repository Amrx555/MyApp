<template>
  <div class="home-container" dir="rtl">
    <header class="hero">
      <div class="hero-content">
        <span class="badge">مرحباً بك في مستقبل الويب</span>
        <h1>صمم واجهتك <span class="gradient-text">بذكاء وإبداع</span></h1>
        <p>
          نحن نقدم لك حلولاً برمجية متكاملة باستخدام أحدث تقنيات Vue.js. سرعة،
          أداء، وتصميم يخطف الأنظار.
        </p>
        <div class="hero-btns">
          <button class="btn-primary large">ابدأ الآن</button>
          <button class="btn-secondary large">مشاهدة العرض</button>
        </div>
      </div>
    </header>

    <section class="stats">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <h3>{{ stat.value }}</h3>
        <p>{{ stat.label }}</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";

const stats = ref([
  { value: "+150", label: "عميل سعيد" },
  { value: "+300", label: "مشروع مكتمل" },
  { value: "24/7", label: "دعم فني" },
]);
</script>

<style scoped>
/* التنسيقات العامة */
.home-container {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #0f172a; /* Dark background */
  color: #f8fafc;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -1px;
}

.dot {
  color: #6366f1;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #94a3b8;
  font-weight: 500;
  transition: 0.3s;
}

.nav-links a:hover,
.nav-links a.active {
  color: #6366f1;
}

/* Buttons */
.btn-primary {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}

.btn-primary:hover {
  background: #4f46e5;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 1px solid #334155;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.large {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

/* Hero Section */
.hero {
  padding: 8rem 10% 5rem;
  text-align: center;
}

.badge {
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.hero h1 {
  font-size: 4rem;
  margin-top: 1.5rem;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(90deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  color: #94a3b8;
  max-width: 700px;
  margin: 1.5rem auto 2.5rem;
  font-size: 1.2rem;
  line-height: 1.8;
}

.hero-btns {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

/* Stats Section */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 5rem 10%;
  text-align: center;
}

.stat-card h3 {
  font-size: 2.5rem;
  color: #f8fafc;
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: #6366f1;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .hero h1 {
    font-size: 2.5rem;
  }
  .hero-btns {
    flex-direction: column;
  }
}
</style>

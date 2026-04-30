<template>
  <nav class="navbar" v-if="user">
    <div class="nav-inner">
      <!-- لوجو -->
      <router-link to="/home" class="nav-logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">MyApp</span>
      </router-link>

      <!-- لينكات -->
      <div class="nav-links" :class="{ open: menuOpen }">
        <router-link to="/home" class="nav-link" @click="menuOpen = false">
          🏠 الرئيسية
        </router-link>
        <router-link to="/dashboard" class="nav-link" @click="menuOpen = false">
          👤 حسابي
        </router-link>
        <router-link
          v-if="isAdmin"
          to="/admin"
          class="nav-link admin-link"
          @click="menuOpen = false"
        >
          🛡️ لوحة الإدارة
        </router-link>
      </div>

      <!-- يمين -->
      <div class="nav-right">
        <div class="user-pill">
          <img :src="avatar" class="nav-avatar" />
          <span class="nav-email">{{ shortEmail }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">خروج</button>
        <button class="burger" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "../supabase";

const router = useRouter();
const route = useRoute();
const user = ref(null);
const isAdmin = ref(false);
const menuOpen = ref(false);

const loadUser = async () => {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    user.value = null;
    return;
  }
  user.value = data.user;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  isAdmin.value = profile?.role === "admin";
};
onMounted(loadUser);
watch(() => route.path, loadUser);
const avatar = computed(() =>
  user.value
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.value.email
      )}&background=f0c060&color=1a1000&size=64`
    : ""
);
const shortEmail = computed(() => user.value?.email?.split("@")[0] || "");
const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/");
};
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(5, 5, 10, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  direction: rtl;
}
.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
}

/* لوجو */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon {
  font-size: 22px;
}
.logo-text {
  color: #48bb78;
  font-weight: 700;
  font-size: 18px;
  font-family: "Cairo", sans-serif;
}

/* لينكات */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.nav-link {
  padding: 8px 16px;
  border-radius: 10px;
  color: #a0aec0;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  font-family: "Cairo", sans-serif;
  transition: 0.2s;
}
.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.06);
}
.nav-link.router-link-active {
  color: #48bb78;
  background: rgba(240, 192, 96, 0.1);
}
.admin-link.router-link-active {
  color: #b794f4;
  background: rgba(120, 64, 220, 0.15);
}

/* يمين */
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
}
.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 4px 12px 4px 4px;
}
.nav-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}
.nav-email {
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
}

.logout-btn {
  padding: 8px 16px;
  background: rgba(252, 100, 100, 0.1);
  border: 1px solid rgba(252, 100, 100, 0.25);
  border-radius: 10px;
  color: #fc8181;
  font-family: "Cairo", sans-serif;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}
.logout-btn:hover {
  background: rgba(252, 100, 100, 0.2);
}

/* برجر موبايل */
.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.burger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #a0aec0;
  border-radius: 2px;
  transition: 0.3s;
}

@media (max-width: 700px) {
  .burger {
    display: flex;
  }
  .nav-links {
    display: none;
    position: absolute;
    top: 64px;
    right: 0;
    left: 0;
    background: rgba(5, 5, 10, 0.97);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    flex-direction: column;
    padding: 16px;
    gap: 8px;
    align-items: stretch;
  }
  .nav-links.open {
    display: flex;
  }
  .user-pill .nav-email {
    display: none;
  }
}
</style>

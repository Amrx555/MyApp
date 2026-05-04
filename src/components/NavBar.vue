<template>
  <nav class="navbar" v-if="user">
    <div class="nav-inner">
      <router-link to="/Home" class="nav-logo">
        <div class="logo-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#f0c060" />
            <path
              d="M2 17l10 5 10-5"
              stroke="#f0c060"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <path
              d="M2 12l10 5 10-5"
              stroke="#f0c060"
              stroke-width="1.8"
              stroke-linecap="round"
              opacity="0.4"
            />
          </svg>
        </div>
        <div class="logo-text-wrap">
          <span class="logo-main">My App</span>
          <span class="logo-dot">●</span>
        </div>
      </router-link>
      <div class="nav-right">
        <div class="settings-wrap" ref="settingsRef">
          <button
            class="settings-btn"
            @click="settingsOpen = !settingsOpen"
            :class="{ active: settingsOpen }"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
          </button>

          <transition name="drop">
            <div class="settings-dropdown" v-if="settingsOpen">
              <router-link
                to="/dashboard"
                class="drop-item"
                @click="settingsOpen = false"
              >
                <span class="drop-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span>حسابي</span>
              </router-link>

              <router-link
                v-if="isAdmin"
                to="/admin"
                class="drop-item admin-item"
                @click="settingsOpen = false"
              >
                <span class="drop-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                    />
                  </svg>
                </span>
                <span> الإدارة</span>
              </router-link>

              <div class="drop-divider"></div>

              <div class="drop-item toggle-item">
                <span class="drop-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </span>
                <span>M</span>
                <button
                  class="toggle-switch"
                  @click="toggleDark"
                  :class="{ on: isDark }"
                >
                  <span class="toggle-thumb"></span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { supabase } from "../supabase";

const user = ref(null);
const isAdmin = ref(false);
const settingsOpen = ref(false);
const settingsRef = ref(null);
const isDark = ref(true);

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

onMounted(() => {
  loadUser();
  document.addEventListener("click", handleOutsideClick);
  isDark.value = document.documentElement.classList.contains("dark") || true;
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});
const handleOutsideClick = (e) => {
  if (settingsRef.value && !settingsRef.value.contains(e.target)) {
    settingsOpen.value = false;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Cairo:wght@600;700&display=swap");

* {
  box-sizing: border-box;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(5, 5, 10, 0.92);
  backdrop-filter: blur(22px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  direction: rtl;
  font-family: "Cairo", sans-serif;
}

.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 62px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon-wrap {
  width: 36px;
  height: 36px;
  background: #0c0c18;
  border: 1px solid rgba(240, 192, 96, 0.28);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 14px rgba(240, 192, 96, 0.1);
  transition: 0.25s;
}
.nav-logo:hover .logo-icon-wrap {
  border-color: rgba(240, 192, 96, 0.5);
  box-shadow: 0 0 20px rgba(240, 192, 96, 0.2);
}
.logo-text-wrap {
  display: flex;
  align-items: center;
  gap: 3px;
}
.logo-main {
  font-family: "Space Grotesk", sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #f0f0f0;
  letter-spacing: 2.5px;
}
.logo-dot {
  font-size: 7px;
  color: #f0c060;
  margin-top: 2px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}
.nav-link {
  padding: 7px 14px;
  border-radius: 9px;
  color: #718096;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.18s;
  white-space: nowrap;
  position: relative;
}
.nav-link:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
}
.nav-link.router-link-active {
  color: #f0c060;
}
.nav-link.router-link-active::after {
  content: "";
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #f0c060;
  border-radius: 50%;
}
.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-family: "Cairo", sans-serif;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: auto;
}

.settings-wrap {
  position: relative;
}

.settings-btn {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.settings-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.14);
}
.settings-btn.active {
  background: rgba(240, 192, 96, 0.1);
  border-color: rgba(240, 192, 96, 0.3);
  color: #f0c060;
}

.settings-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  min-width: 150px;
  background: #0e0e1a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  z-index: 300;
}

.drop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  color: #a0aec0;
  font-size: 14px;
  font-weight: 600;
  font-family: "Cairo", sans-serif;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: none;
  transition: all 0.18s;
  text-align: right;
}
.drop-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
}

.drop-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #718096;
}

.admin-item {
  color: #b794f4;
}
.admin-item .drop-icon {
  background: rgba(120, 64, 220, 0.12);
  color: #b794f4;
}
.admin-item:hover {
  background: rgba(120, 64, 220, 0.1);
}

.logout-item {
  color: #fc8181;
}
.logout-item .drop-icon {
  background: rgba(252, 100, 100, 0.1);
  color: #fc8181;
}
.logout-item:hover {
  background: rgba(252, 100, 100, 0.08);
}

.drop-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
}

.toggle-item {
  justify-content: space-between;
}
.toggle-item > span:not(.drop-icon) {
  flex: 1;
}

.toggle-switch {
  width: 38px;
  height: 21px;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
  padding: 0;
}
.toggle-switch.on {
  background: linear-gradient(90deg, #f0c060, #e8a030);
}
.toggle-thumb {
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: white;
  top: 3px;
  right: 3px;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
.toggle-switch.on .toggle-thumb {
  transform: translateX(-17px);
}

.drop-enter-active,
.drop-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}

.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 9px;
  cursor: pointer;
  padding: 8px 7px;
  transition: 0.2s;
}
.burger:hover {
  border-color: rgba(240, 192, 96, 0.25);
}
.burger span {
  display: block;
  width: 18px;
  height: 1.5px;
  background: #718096;
  border-radius: 2px;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}
.burger.active span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
  background: #f0c060;
}
.burger.active span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.burger.active span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
  background: #f0c060;
}

/* ===== موبايل ===== */
@media (max-width: 750px) {
  .burger {
    display: flex;
  }
  .nav-links {
    display: none;
    position: absolute;
    top: 62px;
    right: 0px;
    left: 0px;
    background: rgba(5, 5, 10, 0.98);
    backdrop-filter: blur(22px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-direction: column;
    align-items: stretch;
    padding: 12px 16px 18px;
    gap: 4px;
    z-index: 199;
  }
  .nav-links.open {
    display: flex;
  }
  .nav-link {
    padding: 12px 16px;
    font-size: 15px;
  }
  .nav-link.router-link-active::after {
    display: none;
  }

  .settings-dropdown {
    right: -100px;
  }
}

@media (max-width: 400px) {
  .logo-main {
    font-size: 14px;
    letter-spacing: 2px;
  }
  .nav-inner {
    padding: 0 14px;
    gap: 12px;
  }
}
</style>

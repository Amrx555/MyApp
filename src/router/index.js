import { createRouter, createWebHistory } from "vue-router";
import LogIn from "../views/LoginView.vue";
import Dashboard from "../views/DashBoard.vue";
import AdminPage from "../views/AdminPage.vue";
import HomeView from "../views/HomeView.vue";

const routes = [
  { path: "/", name: "Login", component: LogIn },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/Admin", name: "AdminPage", component: AdminPage },
  { path: "/home", name: "Home", component: HomeView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

import { useState, useEffect } from "react";
import { useAuth } from "../Components/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { orpcClient } from "../orpcClient";

// Import custom layouts/components
import Sidebar from "../Components/Sidebar";
import TransactionsView from "../Components/TransactionsView";
import StatsView from "../Components/StatsView";
import BudgetsView from "../Components/BudgetsView";
import SettingsView from "../Components/SettingsView";
import AddExpenseModal from "../Components/AddExpenseModal";
import WalletsView from "../Components/WalletsView";

export default function ExpenseDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("transactions");
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const data = await orpcClient.expenses.list({});
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const handleSaveExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        await orpcClient.expenses.update({
          id: editingExpense.id,
          title: expenseData.title,
          amount: Number(expenseData.amount),
          category: expenseData.category,
          type: expenseData.type,
          date: expenseData.date,
        });
        setEditingExpense(null);
      } else {
        await orpcClient.expenses.create({
          title: expenseData.title,
          amount: Number(expenseData.amount),
          category: expenseData.category,
          type: expenseData.type,
          date: expenseData.date,
        });
      }
      fetchExpenses();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save transaction:", err);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await orpcClient.expenses.delete({ id });
      fetchExpenses();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-none py-4 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main panel content */}
      <div className="flex-1 w-full min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {activeTab === "transactions" && (
              <TransactionsView
                expenses={expenses}
                onSaveExpense={handleSaveExpense}
                onDeleteExpense={handleDeleteExpense}
                onEditClick={handleEditClick}
                onAddClick={handleAddClick}
                user={user}
              />
            )}

            {activeTab === "stats" && <StatsView expenses={expenses} user={user} />}

            {activeTab === "budgets" && <BudgetsView expenses={expenses} user={user} />}

            {activeTab === "wallets" && <WalletsView key={user?.id || "wallets"} user={user} />}

            {activeTab === "settings" && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Shared Add/Edit Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddExpenseModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingExpense(null);
            }}
            onSave={handleSaveExpense}
            editingExpense={editingExpense}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

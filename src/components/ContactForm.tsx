// src/components/ContactForm.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Pesan terkirim!");
        setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
      } else {
        throw new Error("Gagal mengirim pesan");
      }
    } catch (error) {
      toast.error("Gagal mengirim pesan. Coba lagi nanti.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Efek animasi untuk setiap input
  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Label htmlFor="name">Nama Anda</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1"
        />
      </motion.div>

      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Label htmlFor="email">Email Anda</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1"
        />
      </motion.div>

      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Label htmlFor="subject">Subjek</Label>
        <Input
          id="subject"
          type="text"
          placeholder="Pertanyaan tentang produk..."
          value={formData.subject}
          onChange={handleChange}
          required
          className="mt-1"
        />
      </motion.div>

      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Label htmlFor="message">Pesan Anda</Label>
        <Textarea
          id="message"
          placeholder="Tulis pesan Anda di sini..."
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="mt-1"
        />
      </motion.div>

      <motion.div
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button type="submit" className="w-full gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {loading ? "Mengirim..." : "Kirim Pesan"}
        </Button>
      </motion.div>
    </form>
  );
}

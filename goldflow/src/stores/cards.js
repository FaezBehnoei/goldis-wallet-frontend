import { defineStore } from "pinia";
import { ref } from "vue";

export const useCardManagement = defineStore('cards', () => {
  const storedCard = JSON.parse(localStorage.getItem('cards'))
  const cards = ref(storedCard)

  const setCardNumber = (card) => {
    cards.value.push(card)
    localStorage.setItem('cards', JSON.stringify(cards.value))
  }



  return{ cards, setCardNumber}
})

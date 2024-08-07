export default (store) => {
  // Carregar o estado salvo do localStorage e inicializar o store
  const savedState = localStorage.getItem('session-state')
  if (savedState) {
    store.replaceState(Object.assign(store.state, JSON.parse(savedState)))
  }

  // Assinar as mudanças do store para atualizar o localStorage
  store.subscribe((mutation, state) => {
    // Aqui você pode escolher quais partes do estado deseja persistir
    const persistState = {
      session: state.session,
    }
    localStorage.setItem('session-state', JSON.stringify(persistState))
  })
}

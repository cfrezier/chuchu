export class ScoreDisplay {
  _highscoreDiv?: HTMLDivElement;

  getHighscoreDiv() {
    if (!this._highscoreDiv) {
      this._highscoreDiv = window.document.body.querySelector(".highscore-content") ?? undefined;
    }
    return this._highscoreDiv!;
  }

  updateHighScore(payload: any) {
    this.getHighscoreDiv().innerHTML = "";

    (payload.players ?? []).forEach((player: any) => {
      this.addScore(player, this.getHighscoreDiv(), 'totalPoints');
    });
  }

  private addScore(player: any, to: HTMLDivElement, type: 'totalPoints' | 'points') {
    const node = document.createElement('div');
    node.classList.add('score-item');
    const playerName = document.createElement('p');
    playerName.innerText = player.name;
    const playerValue = document.createElement('p');
    playerValue.innerText = player[type];
    node.appendChild(playerName);
    node.appendChild(playerValue);
    to?.appendChild(node);
  }
}
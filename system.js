/* ============================================================
   SYSTEM.JS — Handles Persistence and State
   ============================================================ */

const State = {
    mc: 2500,
    hp: 100,
    maxHp: 100,
    streak: 0,
    wave: 1,
    kills: 0,
    skills: {
        ironConstitution: 0, // Health bonus rank
        loadedPockets: 0,    // Starting MC bonus
        fleetFoot: 0         // Speed bonus rank
    }
};

const DataManager = {
    save() {
        localStorage.setItem('zs_elite_data', JSON.stringify(State));
    },
    load() {
        const saved = localStorage.getItem('zs_elite_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            State.skills = parsed.skills;
            this.applySkills();
        }
    },
    applySkills() {
        // Apply persistent upgrades to current session
        State.maxHp = 100 + (State.skills.ironConstitution * 25);
        State.hp = State.maxHp;
        if (State.wave === 1) State.mc += (State.skills.loadedPockets * 500);
    }
};

DataManager.load();

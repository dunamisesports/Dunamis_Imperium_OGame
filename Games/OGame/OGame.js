const express = require('express');
const router = express.Router();


router.route('/Dunamis_esports/OGame.html')
    .post(
        (req, res) => {
            res.sendFile('/home/pi/Documents/DACLE/Dunamis_esports/Ogame.html');
        }
    )
    .get(
        (req, res) => {
            res.sendFile('/home/pi/Documents/DACLE/Dunamis_esports/Ogame.html');
        }
    )

module.exports = router;

const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "", // pour avoir directement "id", pas "@_id"
    allowBooleanAttributes: true
});

const ALLIANCES_URL = "https://s270-fr.ogame.gameforge.com/api/alliances.xml";
const PLAYERS_URL = "https://s270-fr.ogame.gameforge.com/api/players.xml";

const targetAllianceId = "500021"; // ← change ici selon l'ID voulu

async function getXml(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status} pour ${url}`);
    const text = await res.text();
    return parser.parse(text);
}

async function main() {
    try {
        const [alliancesXml, playersXml] = await Promise.all([
            getXml(ALLIANCES_URL),
            getXml(PLAYERS_URL),
        ]);

        const alliances = Array.isArray(alliancesXml.alliances.alliance)
            ? alliancesXml.alliances.alliance
            : [alliancesXml.alliances.alliance];

        const players = Array.isArray(playersXml.players.player)
            ? playersXml.players.player
            : [playersXml.players.player];

        const alliance = alliances.find(a => String(a.id) === targetAllianceId);

        if (!alliance) {
            console.log(`❌ Alliance avec l'ID ${targetAllianceId} non trouvée.`);
            return;
        }

        console.log(`🏴 Alliance "${alliance.name}" [${alliance.tag}]`);
        console.log(`👤 Fondateur ID : ${alliance.founder}`);
        console.log(`🧑‍🚀 Membres :`);

        const members = Array.isArray(alliance.player)
            ? alliance.player
            : [alliance.player];

        for (const p of members) {
            const player = players.find(pl => pl.id === p.id);
            console.log(`  - ${player?.name || "(inconnu)"} (ID ${p.id})`);
        }
    } catch (err) {
        console.error("❌ Erreur :", err.message);
    }
}

main();

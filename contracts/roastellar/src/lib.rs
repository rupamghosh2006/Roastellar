#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String,
};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MatchStatus {
    Open,
    Active,
    Ended,
    Draw,
}

#[contracttype]
#[derive(Clone)]
pub struct User {
    pub address: Address,
    pub username: String,
    pub xp: u32,
    pub wins: u32,
    pub losses: u32,
    pub rank_points: u32,
    pub profile_cid: String,
}

#[contracttype]
#[derive(Clone)]
pub struct Match {
    pub match_id: u32,
    pub creator: Address,
    pub player1: Address,
    pub player2: Option<Address>,
    pub entry_fee: i128,
    pub topic_cid: String,
    pub roast1_cid: Option<String>,
    pub roast2_cid: Option<String>,
    pub status: MatchStatus,
    pub winner: Option<Address>,
    pub votes_player1: u32,
    pub votes_player2: u32,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Prediction {
    pub predictor: Address,
    pub selected_player: Address,
    pub amount: i128,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Badge {
    FirstWin,
    FiveWins,
    TenMatches,
}

#[contracttype]
pub enum DataKey {
    User(Address),
    Match(u32),
    UserBadge(Address, Badge),
    Prediction(u32, Address),
    MatchCount,
    HasJoined(Address, u32),
    HasVoted(Address, u32),
}

#[contract]
pub struct Roastellar;

#[contractimpl]
impl Roastellar {
    pub fn register_user(e: Env, user: Address, username: String, profile_cid: String) {
        user.require_auth();
        let key = DataKey::User(user.clone());
        if e.storage().instance().get::<_, User>(&key).is_some() {
            panic!("user already registered");
        }
        let new_user = User {
            address: user.clone(),
            username,
            xp: 0,
            wins: 0,
            losses: 0,
            rank_points: 0,
            profile_cid,
        };
        e.storage().instance().set(&key, &new_user);
    }

    pub fn get_user(e: Env, user: Address) -> Option<User> {
        let key = DataKey::User(user);
        e.storage().instance().get(&key)
    }

    pub fn update_profile(e: Env, user: Address, profile_cid: String) {
        user.require_auth();
        let key = DataKey::User(user.clone());
        if let Some(mut user_data) = e.storage().instance().get::<_, User>(&key) {
            user_data.profile_cid = profile_cid;
            e.storage().instance().set(&key, &user_data);
        } else {
            panic!("user not registered");
        }
    }

    pub fn create_match(e: Env, entry_fee: i128, topic_cid: String, user: Address) -> u32 {
        user.require_auth();
        if entry_fee <= 0 {
            panic!("entry fee must be positive");
        }
        let key = DataKey::MatchCount;
        let match_count: u32 = e.storage().instance().get(&key).unwrap_or(0);
        let new_match_id = match_count + 1;
        e.storage().instance().set(&key, &new_match_id);
        let match_key = DataKey::Match(new_match_id);
        let new_match = Match {
            match_id: new_match_id,
            creator: user.clone(),
            player1: user.clone(),
            player2: None,
            entry_fee,
            topic_cid,
            roast1_cid: None,
            roast2_cid: None,
            status: MatchStatus::Open,
            winner: None,
            votes_player1: 0,
            votes_player2: 0,
            created_at: e.ledger().timestamp(),
        };
        e.storage().instance().set(&match_key, &new_match);
        new_match_id
    }

    pub fn get_match(e: Env, match_id: u32) -> Option<Match> {
        let key = DataKey::Match(match_id);
        e.storage().instance().get(&key)
    }

    pub fn join_match(e: Env, match_id: u32, player: Address) {
        player.require_auth();
        let key = DataKey::Match(match_id);
        let mut match_data = match e.storage().instance().get::<_, Match>(&key) {
            Some(m) => m,
            None => panic!("match not found"),
        };
        if match_data.status != MatchStatus::Open {
            panic!("match is not open");
        }
        let join_key = DataKey::HasJoined(player.clone(), match_id);
        if e.storage().instance().get::<_, bool>(&join_key).is_some() {
            panic!("already joined this match");
        }
        let p1_key = DataKey::HasJoined(match_data.player1.clone(), match_id);
        if e.storage().instance().get::<_, bool>(&p1_key).is_none() {
            e.storage().instance().set(&p1_key, &true);
        }
        e.storage().instance().set(&join_key, &true);
        match_data.player2 = Some(player.clone());
        match_data.status = MatchStatus::Active;
        e.storage().instance().set(&key, &match_data);
    }

    pub fn submit_roast(e: Env, match_id: u32, roast_cid: String, player: Address) {
        player.require_auth();
        let key = DataKey::Match(match_id);
        let mut match_data = match e.storage().instance().get::<_, Match>(&key) {
            Some(m) => m,
            None => panic!("match not found"),
        };
        if match_data.status != MatchStatus::Active {
            panic!("match not active");
        }
        let is_p1 = match_data.player1 == player;
        let is_p2 = match_data.player2 == Some(player);
        if !is_p1 && !is_p2 {
            panic!("only participants can submit roasts");
        }
        if is_p1 {
            if match_data.roast1_cid.is_some() {
                panic!("roast already submitted");
            }
            match_data.roast1_cid = Some(roast_cid.clone());
        }
        if is_p2 {
            if match_data.roast2_cid.is_some() {
                panic!("roast already submitted");
            }
            match_data.roast2_cid = Some(roast_cid);
        }
        e.storage().instance().set(&key, &match_data);
    }

    pub fn vote(e: Env, match_id: u32, selected_player: Address, voter: Address) {
        voter.require_auth();
        let vote_key = DataKey::HasVoted(voter.clone(), match_id);
        if e.storage().instance().get::<_, bool>(&vote_key).is_some() {
            panic!("already voted in this match");
        }
        e.storage().instance().set(&vote_key, &true);
        let key = DataKey::Match(match_id);
        let mut match_data = match e.storage().instance().get::<_, Match>(&key) {
            Some(m) => m,
            None => panic!("match not found"),
        };
        if match_data.status != MatchStatus::Active {
            panic!("match not active for voting");
        }
        let valid_p1 = match_data.player1 == selected_player;
        let valid_p2 = match_data.player2 == Some(selected_player);
        if !valid_p1 && !valid_p2 {
            panic!("invalid player selected");
        }
        if valid_p1 {
            match_data.votes_player1 += 1;
        }
        if valid_p2 {
            match_data.votes_player2 += 1;
        }
        e.storage().instance().set(&key, &match_data);
    }

    pub fn predict(e: Env, match_id: u32, selected_player: Address, amount: i128, predictor: Address) {
        predictor.require_auth();
        if amount <= 0 {
            panic!("prediction amount must be positive");
        }
        let key = DataKey::Match(match_id);
        let match_data = match e.storage().instance().get::<_, Match>(&key) {
            Some(m) => m,
            None => panic!("match not found"),
        };
        if match_data.status != MatchStatus::Active {
            panic!("match not active for prediction");
        }
        let prediction_key = DataKey::Prediction(match_id, predictor.clone());
        if e.storage().instance().get::<_, Prediction>(&prediction_key).is_some() {
            panic!("already placed prediction");
        }
        let prediction = Prediction {
            predictor: predictor.clone(),
            selected_player,
            amount,
        };
        e.storage().instance().set(&prediction_key, &prediction);
    }

    pub fn finalize_match(e: Env, match_id: u32) {
        let key = DataKey::Match(match_id);
        let mut match_data = match e.storage().instance().get::<_, Match>(&key) {
            Some(m) => m,
            None => panic!("match not found"),
        };
        if match_data.status == MatchStatus::Ended || match_data.status == MatchStatus::Draw {
            panic!("match already finalized");
        }
        if match_data.status != MatchStatus::Active {
            panic!("match not active");
        }
        if match_data.roast1_cid.is_none() || match_data.roast2_cid.is_none() {
            panic!("both roasts must be submitted");
        }
        if match_data.votes_player1 == match_data.votes_player2 {
            match_data.status = MatchStatus::Draw;
            match_data.winner = None;
            e.storage().instance().set(&key, &match_data);
            return;
        }
        let winner: Address = if match_data.votes_player1 > match_data.votes_player2 {
            match_data.player1.clone()
        } else {
            match match_data.player2.clone() {
                Some(p2) => p2,
                None => panic!("player2 missing at finalize"),
            }
        };
        let mut winner_updated: Option<User> = None;
        let mut loser_updated: Option<User> = None;
        {
            let user_key = DataKey::User(match_data.player1.clone());
            if let Some(mut user) = e.storage().instance().get::<_, User>(&user_key) {
                if match_data.player1 == winner {
                    user.wins += 1;
                    user.xp += 100;
                    user.rank_points += 10;
                    if user.wins == 1 {
                        let badge_key = DataKey::UserBadge(user.address.clone(), Badge::FirstWin);
                        e.storage().instance().set(&badge_key, &true);
                    } else if user.wins == 5 {
                        let badge_key = DataKey::UserBadge(user.address.clone(), Badge::FiveWins);
                        e.storage().instance().set(&badge_key, &true);
                    }
                    winner_updated = Some(user);
                } else {
                    user.losses += 1;
                    user.xp += 10;
                    loser_updated = Some(user);
                }
            }
        }
        if let Some(p2) = &match_data.player2 {
            let user_key = DataKey::User(p2.clone());
            if let Some(mut user) = e.storage().instance().get::<_, User>(&user_key) {
                if *p2 == winner {
                    user.wins += 1;
                    user.xp += 100;
                    user.rank_points += 10;
                    if user.wins == 1 {
                        let badge_key = DataKey::UserBadge(user.address.clone(), Badge::FirstWin);
                        e.storage().instance().set(&badge_key, &true);
                    } else if user.wins == 5 {
                        let badge_key = DataKey::UserBadge(user.address.clone(), Badge::FiveWins);
                        e.storage().instance().set(&badge_key, &true);
                    }
                    winner_updated = Some(user);
                } else {
                    user.losses += 1;
                    user.xp += 10;
                    loser_updated = Some(user);
                }
            }
        }
        if let Some(wuser) = winner_updated {
            let wkey = DataKey::User(wuser.address.clone());
            e.storage().instance().set(&wkey, &wuser);
        }
        if let Some(luser) = loser_updated {
            let lkey = DataKey::User(luser.address.clone());
            e.storage().instance().set(&lkey, &luser);
        }
        let total_matches_user = DataKey::User(match_data.player1.clone());
        if let Some(total_user) = e.storage().instance().get::<_, User>(&total_matches_user) {
            let matches = total_user.wins + total_user.losses;
            if matches >= 10 {
                let badge_key = DataKey::UserBadge(total_user.address.clone(), Badge::TenMatches);
                e.storage().instance().set(&badge_key, &true);
            }
        }
        if let Some(p2) = &match_data.player2 {
            let total_matches_user2 = DataKey::User(p2.clone());
            if let Some(total_user2) = e.storage().instance().get::<_, User>(&total_matches_user2) {
                let matches = total_user2.wins + total_user2.losses;
                if matches >= 10 {
                    let badge_key = DataKey::UserBadge(total_user2.address.clone(), Badge::TenMatches);
                    e.storage().instance().set(&badge_key, &true);
                }
            }
        }
        match_data.winner = Some(winner);
        match_data.status = MatchStatus::Ended;
        e.storage().instance().set(&key, &match_data);
    }

    pub fn has_badge(e: Env, user: Address, badge: Badge) -> bool {
        let key = DataKey::UserBadge(user, badge);
        e.storage().instance().get(&key).unwrap_or(false)
    }
}

#[cfg(test)]
mod tests {
    use soroban_sdk::{Env, Address, String};
    use soroban_sdk::testutils::Address as _;
    use crate::{Roastellar, RoastellarClient, MatchStatus, Badge};

    #[test]
    fn test_register_user() {
        let env = Env::default();
        let user = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username = String::from_str(&env, "testuser");
        let profile_cid = String::from_str(&env, "QmProfile");
        client.register_user(&user, &username, &profile_cid);
        let user_data = client.get_user(&user).unwrap();
        assert_eq!(user_data.username, username);
    }

    #[test]
    #[should_panic(expected = "user already registered")]
    fn test_duplicate_registration() {
        let env = Env::default();
        let user = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username = String::from_str(&env, "testuser");
        let profile_cid = String::from_str(&env, "QmProfile");
        client.register_user(&user, &username, &profile_cid);
        client.register_user(&user, &username, &profile_cid);
    }

    #[test]
    fn test_create_and_join_match() {
        let env = Env::default();
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username1 = String::from_str(&env, "user1");
        let username2 = String::from_str(&env, "user2");
        let profile_cid1 = String::from_str(&env, "QmProfile1");
        let profile_cid2 = String::from_str(&env, "QmProfile2");
        client.register_user(&user1, &username1, &profile_cid1);
        client.register_user(&user2, &username2, &profile_cid2);
        let entry_fee = 100i128;
        let topic_cid = String::from_str(&env, "QmTopic1");
        let match_id = client.create_match(&entry_fee, &topic_cid, &user1);
        assert_eq!(match_id, 1);
        let match_data = client.get_match(&match_id).unwrap();
        assert_eq!(match_data.status, MatchStatus::Open);
        client.join_match(&match_id, &user2);
        let match_data = client.get_match(&match_id).unwrap();
        assert_eq!(match_data.status, MatchStatus::Active);
    }

    #[test]
    fn test_submit_roast() {
        let env = Env::default();
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username1 = String::from_str(&env, "user1");
        let username2 = String::from_str(&env, "user2");
        let profile_cid1 = String::from_str(&env, "QmProfile1");
        let profile_cid2 = String::from_str(&env, "QmProfile2");
        client.register_user(&user1, &username1, &profile_cid1);
        client.register_user(&user2, &username2, &profile_cid2);
        let entry_fee = 100i128;
        let topic_cid = String::from_str(&env, "QmTopic1");
        let match_id = client.create_match(&entry_fee, &topic_cid, &user1);
        client.join_match(&match_id, &user2);
        let roast1_cid = String::from_str(&env, "QmRoast1");
        let roast2_cid = String::from_str(&env, "QmRoast2");
        client.submit_roast(&match_id, &roast1_cid, &user1);
        client.submit_roast(&match_id, &roast2_cid, &user2);
        let match_data = client.get_match(&match_id).unwrap();
        assert!(match_data.roast1_cid.is_some());
        assert!(match_data.roast2_cid.is_some());
    }

    #[test]
    fn test_vote() {
        let env = Env::default();
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username1 = String::from_str(&env, "user1");
        let username2 = String::from_str(&env, "user2");
        let profile_cid1 = String::from_str(&env, "QmProfile1");
        let profile_cid2 = String::from_str(&env, "QmProfile2");
        client.register_user(&user1, &username1, &profile_cid1);
        client.register_user(&user2, &username2, &profile_cid2);
        let entry_fee = 100i128;
        let topic_cid = String::from_str(&env, "QmTopic1");
        let match_id = client.create_match(&entry_fee, &topic_cid, &user1);
        client.join_match(&match_id, &user2);
        let roast1_cid = String::from_str(&env, "QmRoast1");
        let roast2_cid = String::from_str(&env, "QmRoast2");
        client.submit_roast(&match_id, &roast1_cid, &user1);
        client.submit_roast(&match_id, &roast2_cid, &user2);
        let voter = Address::generate(&env);
        client.vote(&match_id, &user1, &voter);
        let match_data = client.get_match(&match_id).unwrap();
        assert_eq!(match_data.votes_player1, 1);
    }

    #[test]
    #[should_panic(expected = "already voted")]
    fn test_double_vote_prevented() {
        let env = Env::default();
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username1 = String::from_str(&env, "user1");
        let username2 = String::from_str(&env, "user2");
        let profile_cid1 = String::from_str(&env, "QmProfile1");
        let profile_cid2 = String::from_str(&env, "QmProfile2");
        client.register_user(&user1, &username1, &profile_cid1);
        client.register_user(&user2, &username2, &profile_cid2);
        let entry_fee = 100i128;
        let topic_cid = String::from_str(&env, "QmTopic1");
        let match_id = client.create_match(&entry_fee, &topic_cid, &user1);
        client.join_match(&match_id, &user2);
        let voter = Address::generate(&env);
        client.vote(&match_id, &user1, &voter);
        client.vote(&match_id, &user1, &voter);
    }

    #[test]
    fn test_prediction() {
        let env = Env::default();
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username1 = String::from_str(&env, "user1");
        let username2 = String::from_str(&env, "user2");
        let profile_cid1 = String::from_str(&env, "QmProfile1");
        let profile_cid2 = String::from_str(&env, "QmProfile2");
        client.register_user(&user1, &username1, &profile_cid1);
        client.register_user(&user2, &username2, &profile_cid2);
        let entry_fee = 100i128;
        let topic_cid = String::from_str(&env, "QmTopic1");
        let match_id = client.create_match(&entry_fee, &topic_cid, &user1);
        client.join_match(&match_id, &user2);
        let predictor = Address::generate(&env);
        let amount = 50i128;
        client.predict(&match_id, &user1, &amount, &predictor);
    }

    #[test]
    fn test_finalize_winner() {
        let env = Env::default();
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username1 = String::from_str(&env, "user1");
        let username2 = String::from_str(&env, "user2");
        let profile_cid1 = String::from_str(&env, "QmProfile1");
        let profile_cid2 = String::from_str(&env, "QmProfile2");
        client.register_user(&user1, &username1, &profile_cid1);
        client.register_user(&user2, &username2, &profile_cid2);
        let entry_fee = 100i128;
        let topic_cid = String::from_str(&env, "QmTopic1");
        let match_id = client.create_match(&entry_fee, &topic_cid, &user1);
        client.join_match(&match_id, &user2);
        let roast1_cid = String::from_str(&env, "QmRoast1");
        let roast2_cid = String::from_str(&env, "QmRoast2");
        client.submit_roast(&match_id, &roast1_cid, &user1);
        client.submit_roast(&match_id, &roast2_cid, &user2);
        let voter = Address::generate(&env);
        client.vote(&match_id, &user1, &voter);
        client.vote(&match_id, &user1, &user2);
        client.finalize_match(&match_id);
        let match_data = client.get_match(&match_id).unwrap();
        assert_eq!(match_data.status, MatchStatus::Ended);
    }

    #[test]
    fn test_draw_match() {
        let env = Env::default();
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username1 = String::from_str(&env, "user1");
        let username2 = String::from_str(&env, "user2");
        let profile_cid1 = String::from_str(&env, "QmProfile1");
        let profile_cid2 = String::from_str(&env, "QmProfile2");
        client.register_user(&user1, &username1, &profile_cid1);
        client.register_user(&user2, &username2, &profile_cid2);
        let entry_fee = 100i128;
        let topic_cid = String::from_str(&env, "QmTopic1");
        let match_id = client.create_match(&entry_fee, &topic_cid, &user1);
        client.join_match(&match_id, &user2);
        let roast1_cid = String::from_str(&env, "QmRoast1");
        let roast2_cid = String::from_str(&env, "QmRoast2");
        client.submit_roast(&match_id, &roast1_cid, &user1);
        client.submit_roast(&match_id, &roast2_cid, &user2);
        let voter1 = Address::generate(&env);
        let voter2 = Address::generate(&env);
        client.vote(&match_id, &user1, &voter1);
        client.vote(&match_id, &user2, &voter2);
        client.finalize_match(&match_id);
        let match_data = client.get_match(&match_id).unwrap();
        assert_eq!(match_data.status, MatchStatus::Draw);
    }

    #[test]
    fn test_badge_award() {
        let env = Env::default();
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register(Roastellar, ());
        let client = RoastellarClient::new(&env, &contract_id);
        env.mock_all_auths();
        let username1 = String::from_str(&env, "user1");
        let username2 = String::from_str(&env, "user2");
        let profile_cid1 = String::from_str(&env, "QmProfile1");
        let profile_cid2 = String::from_str(&env, "QmProfile2");
        client.register_user(&user1, &username1, &profile_cid1);
        client.register_user(&user2, &username2, &profile_cid2);
        let entry_fee = 100i128;
        let topic_cid = String::from_str(&env, "QmTopic1");
        let match_id = client.create_match(&entry_fee, &topic_cid, &user1);
        client.join_match(&match_id, &user2);
        let roast1_cid = String::from_str(&env, "QmRoast1");
        let roast2_cid = String::from_str(&env, "QmRoast2");
        client.submit_roast(&match_id, &roast1_cid, &user1);
        client.submit_roast(&match_id, &roast2_cid, &user2);
        let voter = Address::generate(&env);
        client.vote(&match_id, &user1, &voter);
        client.vote(&match_id, &user1, &user2);
        client.finalize_match(&match_id);
        assert!(client.has_badge(&user1, &Badge::FirstWin));
    }
}

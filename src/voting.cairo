/// @dev Core Library Imports for the Traits outside the Starknet Contract
use core::starknet::ContractAddress;

/// @dev Trait defining the functions that can be implemented or called by the Starknet Contract
#[starknet::interface]
trait VoteTrait<T> {
    /// @dev Function that returns the current vote status
    fn get_vote_status(self: @T) -> (u256, u256);
    /// @dev Function that checks if the user at the specified address is allowed to vote
    fn voter_can_vote(self: @T, user_address: ContractAddress) -> bool;
    /// @dev Function that checks if the specified address is registered as a voter
    fn is_voter_registered(self: @T, address: ContractAddress) -> bool;
    /// @dev Function that allows a user to vote
    fn vote(ref self: T, vote: Array<u256>);
    /// @dev Function that allows a user to register a voter
    fn register_voters(ref self: T, voters: Array<ContractAddress>);
}

/// @dev Starknet Contract allowing three registered voters to vote on a proposal
#[starknet::contract]
mod Vote {
    use core::starknet::ContractAddress;
    use core::starknet::get_caller_address;
    use core::starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess,
        StorageMapWriteAccess, Map
    };

    const YES: u256 = 1_u256;
    const NO: u256 = 0_u256;

    /// @dev Structure that stores vote counts and voter states
    #[storage]
    struct Storage {
        yes_votes: u256,
        no_votes: u256,
        can_vote: Map::<ContractAddress, bool>,
        registered_voter: Map::<ContractAddress, bool>,
        n: u256
    }

    /// @dev Contract constructor initializing the contract with a list of registered voters and 0
    /// vote count
    #[constructor]
    fn constructor(
        ref self: ContractState,
        voters: Array<ContractAddress>,
        yes_init: u256,
        no_init: u256,
        n: u256
    ) {
        // Register all voters by calling the _register_voters function
        self._register_voters(voters);

        // Initialize the vote count to 0
        self.yes_votes.write(yes_init);
        self.no_votes.write(no_init);
        self.n.write(n);
    }

    /// @dev Event that gets emitted when a vote is cast
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        VoteCast: VoteCast,
        UnauthorizedAttempt: UnauthorizedAttempt,
    }

    /// @dev Represents a vote that was cast
    #[derive(Drop, starknet::Event)]
    struct VoteCast {
        voter: ContractAddress,
        vote: Array<u256>,
    }

    /// @dev Represents an unauthorized attempt to vote
    #[derive(Drop, starknet::Event)]
    struct UnauthorizedAttempt {
        unauthorized_address: ContractAddress,
    }

    /// @dev Implementation of VoteTrait for ContractState
    #[abi(embed_v0)]
    impl VoteImpl of super::VoteTrait<ContractState> {
        /// @dev Returns the voting results
        fn get_vote_status(self: @ContractState) -> (u256, u256) {
            let (n_yes, n_no) = self._get_voting_result();
            (n_yes, n_no)
        }

        /// @dev Check whether a voter is allowed to vote
        fn voter_can_vote(self: @ContractState, user_address: ContractAddress) -> bool {
            self.can_vote.read(user_address)
        }

        /// @dev Check whether an address is registered as a voter
        fn is_voter_registered(self: @ContractState, address: ContractAddress) -> bool {
            self.registered_voter.read(address)
        }

        /// @dev Register a chunk of voters
        fn register_voters(ref self: ContractState, voters: Array<ContractAddress>) {
            self._register_voters(voters);
        }

        /// @dev Submit a vote
        fn vote(ref self: ContractState, vote: Array<u256>) {
            let caller: ContractAddress = get_caller_address();
            self._assert_allowed(caller);
            self.can_vote.write(caller, false);

            self.no_votes.write(self._add_parllier(self.no_votes.read(), *vote.at(0), self.n.read()));
            self.yes_votes.write(self._add_parllier(self.yes_votes.read(), *vote.at(1), self.n.read()));
            
            self.emit(VoteCast { voter: caller, vote: vote, });
        }
    }

    /// @dev Internal Functions implementation for the Vote contract
    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        /// @dev Registers the voters and initializes their voting status to true (can vote)
        fn _register_voters(
            ref self: ContractState,
            voters: Array<ContractAddress>
        ) {

            for voter in voters {
                self.registered_voter.write(voter, true);
                self.can_vote.write(voter, true);
            };
        }

        fn _add_parllier(ref self: ContractState, c1: u256, c2: u256, n: u256) -> u256 {
            let n2 = n * n;
            c1 * c2 % n2
        }
    }

    /// @dev Asserts implementation for the Vote contract
    #[generate_trait]
    impl AssertsImpl of AssertsTrait {
        // @dev Internal function that checks if an address is allowed to vote
        fn _assert_allowed(ref self: ContractState, address: ContractAddress) {
            let is_voter: bool = self.registered_voter.read((address));
            let can_vote: bool = self.can_vote.read((address));

            if (!can_vote) {
                self.emit(UnauthorizedAttempt { unauthorized_address: address, });
            }

            assert!(is_voter, "USER_NOT_REGISTERED");
            assert!(can_vote, "USER_ALREADY_VOTED");
        }
    }

    /// @dev Implement the VotingResultTrait for the Vote contract
    #[generate_trait]
    impl VoteResultFunctionsImpl of VoteResultFunctionsTrait {
        // @dev Internal function to get the voting results (yes and no vote counts)
        fn _get_voting_result(self: @ContractState) -> (u256, u256) {
            let n_yes: u256 = self.yes_votes.read();
            let n_no: u256 = self.no_votes.read();

            (n_yes, n_no)
        }

        // @dev Internal function to calculate the voting results in percentage
        fn _get_voting_result_in_percentage(self: @ContractState) -> (u256, u256) {
            let n_yes: u256 = self.yes_votes.read();
            let n_no: u256 = self.no_votes.read();

            let total_votes: u256 = n_yes + n_no;

            if (total_votes == 0_u256) {
                return (0, 0);
            }
            let yes_percentage: u256 = (n_yes * 100_u256) / (total_votes);
            let no_percentage: u256 = (n_no * 100_u256) / (total_votes);

            (yes_percentage, no_percentage)
        }
    }
}

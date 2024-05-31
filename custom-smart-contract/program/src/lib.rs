use solana_program::{
    pubkey::Pubkey,
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult
};

// Declare and export the program's entrypoint
entrypoint!(proccess_instruction);

// Program entrypoint's implementation
pub fn proccess_instruction(
    program_id: &Pubkey, // Public key of the account the program is loaded into
    accounts: &[AccountInfo], // Accounts that can be accessed by the program
    instruction_data: &[u8] // Raw instruction data passed to the program
) -> ProgramResult {
    Ok(())
}

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    pubkey::Pubkey,
    account_info::{next_account_info, AccountInfo},
    msg,
    entrypoint,
    entrypoint::ProgramResult,
    program_error::ProgramError
};


// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize)]
pub struct GreetingAccount {
    pub counter: u32,
}

// Declare and export the program's entrypoint
entrypoint!(proccess_instruction);

pub fn proccess_instruction(
    program_id: &Pubkey, // Public key of the account the program is loaded into
    accounts: &[AccountInfo], // Accounts that can be accessed by the program
    instruction_data: &[u8] // Raw instruction data passed to the program
) -> ProgramResult {
		let accounts_iter = &mut accounts.iter();

    // Get the PDA account
    let account = next_account_info(accounts_iter)?;
    
    // The PDA account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Increment and store the number of times the account has been greeted
    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?; // Deserializing the data
    greeting_account.counter += 1; // Modified the data
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?; // Serializing

    msg!("{}", greeting_account.counter);
    Ok(())
}
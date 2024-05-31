use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    pubkey::Pubkey,
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program_error::ProgramError
};

// Declare and export the program's entrypoint
entrypoint!(proccess_instruction);

const MAX_LENGTH_STRING: usize = 280;

#[derive(BorshDeserialize, BorshSerialize, Debug)]
struct MessageAccount{
    message: String
}

// Program entrypoint's implementation
pub fn proccess_instruction(
    program_id: &Pubkey, // Public key of the account the program is loaded into
    accounts: &[AccountInfo], // Accounts that can be accessed by the program
    instruction_data: &[u8] // Raw instruction data passed to the program
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter(); // Iterating accounts is safer than indexing by making it iterable

    if accounts_iter.len() < 1 {
        return Err(ProgramError::NotEnoughAccountKeys);
    };

    // Getting the PDA account
    let account = next_account_info(accounts_iter)?;
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId)
    }

    if instruction_data.len() > MAX_LENGTH_STRING {
        return Err(ProgramError::InvalidInstructionData);
    }

    let mut message_bytes = vec![b' '; MAX_LENGTH_STRING]; // Create a vector of 280 spaces

    // Copy the content of instruction_data to message_bytes
    let len = instruction_data.len().min(MAX_LENGTH_STRING);
    message_bytes[..len].copy_from_slice(instruction_data);

    let message = match String::from_utf8(message_bytes.to_vec()){
        Ok(msg)=>msg,
        Err(_)=> return Err(ProgramError::InvalidInstructionData)
    };

    let message_account = MessageAccount{
        message,
    };

   let _ = message_account.serialize(&mut &mut account.try_borrow_mut_data()?[..]);
    // serializes the message_account struct into bytes and then writes those
    // bytes into the mutable data slice of the account. 
    // This effectively updates the data of the account with 
    // the serialized representation of the message_account struct
    Ok(())
}

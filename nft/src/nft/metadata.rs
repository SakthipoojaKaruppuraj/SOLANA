use mpl_token_metadata::instructions::CreateMetadataAccountV3Builder;

pub fn test_metadata_module() {
    let _builder = CreateMetadataAccountV3Builder::new();

    println!("Metadata Builder Loaded");
}
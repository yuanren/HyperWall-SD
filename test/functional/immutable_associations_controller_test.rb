require 'test_helper'

class ImmutableAssociationsControllerTest < ActionController::TestCase
  setup do
    @immutable_association = immutable_associations(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:immutable_associations)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create immutable_association" do
    assert_difference('ImmutableAssociation.count') do
      post :create, immutable_association: { associationId: @immutable_association.associationId, objectId: @immutable_association.objectId }
    end

    assert_redirected_to immutable_association_path(assigns(:immutable_association))
  end

  test "should show immutable_association" do
    get :show, id: @immutable_association
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @immutable_association
    assert_response :success
  end

  test "should update immutable_association" do
    put :update, id: @immutable_association, immutable_association: { associationId: @immutable_association.associationId, objectId: @immutable_association.objectId }
    assert_redirected_to immutable_association_path(assigns(:immutable_association))
  end

  test "should destroy immutable_association" do
    assert_difference('ImmutableAssociation.count', -1) do
      delete :destroy, id: @immutable_association
    end

    assert_redirected_to immutable_associations_path
  end
end
